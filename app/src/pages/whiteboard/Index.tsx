import {
  Box,
  Card,
  Divider,
  Typography,
  Button,
  Badge,
  Modal,
  ModalClose,
  ModalDialog
} from "@mui/joy";
import CheckAuth from "../CheckAuth";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  serverTimestamp,
  runTransaction,
} from "firebase/database";
import { app, auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import UserProfile from "../../components/UserProfile";
import { LuLayoutDashboard } from "react-icons/lu";
import CoolMo from "../../components/CoolMo";

// CodeMirror関連import
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';

// 差分取得用
import { diffChars } from 'diff';

const database = getDatabase(app);
const ACTIVE_THRESHOLD = 3 * 60 * 1000; // 3分

const Whiteboard = () => {
  const [content, setContent] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");
  const [user] = useIdToken(auth);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  // コンフリクト用のステート
  const [conflict, setConflict] = useState<boolean>(false);
  const [serverContentOnConflict, setServerContentOnConflict] = useState<string>("");
  const [localContentOnConflict, setLocalContentOnConflict] = useState<string>("");

  // 差分表示用
  const getDiff = (oldStr: string, newStr: string) => {
    // diffCharsは文字単位での差分取得
    // 実運用ではdiffLinesなど行単位差分の方が使いやすい場合もある
    return diffChars(oldStr, newStr);
  };

  const updateUserActivity = () => {
    if (user) {
      const userActivityRef = ref(
        database,
        `whiteboard/activeUsers/${user.uid}`
      );
      runTransaction(userActivityRef, () => {
        return serverTimestamp();
      });
    }
  };

  useEffect(() => {
    // コンテンツ購読
    const whiteboardRef = ref(database, "whiteboard/content");
    const contentUnsubscribe = onValue(whiteboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setContent(data);
        setDraftContent((draft) => {
          // draftがサーバーと違う場合、既にユーザーが編集中かもしれないが
          // 今回はとりあえずサーバーの最新を`content`として受け取り続ける。
          return draft === "" ? data : draft; 
        });
      }
    });

    // アクティブユーザー購読
    const activeUsersRef = ref(database, "whiteboard/activeUsers");
    const activeUsersUnsubscribe = onValue(activeUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = Date.now();
        const activeUids = Object.entries(data)
          .filter(([, timestamp]) => {
            const lastActive = timestamp as number;
            return now - lastActive <= ACTIVE_THRESHOLD;
          })
          .map(([uid]) => uid);
        setActiveUsers(activeUids);
      }
    });

    // ユーザー活動状況更新の定期実行
    const activityInterval = setInterval(updateUserActivity, 60000); // 1分ごと
    updateUserActivity(); // 初回実行

    return () => {
      contentUnsubscribe();
      activeUsersUnsubscribe();
      clearInterval(activityInterval);
    };
  }, [user]);

  const handleUpdate = () => {
    if (!user) return;
    const whiteboardRef = ref(database, "whiteboard/content");

    runTransaction(whiteboardRef, (currentContent) => {
      if (currentContent === content) {
        // 衝突なし
        return draftContent;
      } else {
        // 衝突発生
        return undefined; 
      }
    }).then((result) => {
      if (result.committed) {
        // 更新成功
        setContent(draftContent);
      } else {
        // 衝突が発生した場合
        // サーバー側の最新とローカルのdraftContentの差分を取得する
        setServerContentOnConflict(result.snapshot?.val() || "");
        setLocalContentOnConflict(draftContent);
        setConflict(true);
      }
    }).catch((error) => {
      console.error(error);
      alert("更新中にエラーが発生しました。");
    });
  };

  // コンフリクト時にユーザーがマージ決定したときの処理
  const handleMergeUpdate = (mergedContent: string) => {
    const whiteboardRef = ref(database, "whiteboard/content");
    // 再度トランザクション実行
    runTransaction(whiteboardRef, (currentContent) => {
      // 再度コンフリクトが起きていないかチェック
      if (currentContent === serverContentOnConflict) {
        return mergedContent;
      } else {
        // ここでもう一度衝突が起きたら再びマージプロセスへ
        return undefined;
      }
    }).then((result) => {
      if (result.committed) {
        // マージ完了
        setContent(mergedContent);
        setDraftContent(mergedContent);
        setConflict(false);
      } else {
        // 再度衝突したら、またマージUIを表示するなどの処理を行う
        alert("再度他のユーザーによる更新がありました。再度マージしてください。");
        setServerContentOnConflict(result.snapshot?.val() || "");
        // localContentOnConflictはmergedContentで更新する
        setLocalContentOnConflict(mergedContent);
        setConflict(true);
      }
    }).catch((error) => {
      console.error(error);
      alert("マージ中にエラーが発生しました。");
    });
  };

  // 差分をもとにシンプルなマージUIを表示する例
  // 本来はもっと分かりやすいUIを作成すべき
  const renderDiffUI = () => {
    const diffs = getDiff(serverContentOnConflict, localContentOnConflict);
    // diffオブジェクトは{value: string, added?: boolean, removed?: boolean}を持つ
    // ここでは簡易的にサーバーとローカルの差分を並べる
    // 実際は2ペイン比較などを行えるUIを組むとよい
    return diffs.map((part, index) => {
      const color = part.added ? "green" : part.removed ? "red" : "inherit";
      return (
        <span key={index} style={{color}}>
          {part.value}
        </span>
      );
    });
  };

  // マージの例として、ユーザーが完全にサーバー版を選ぶかローカル版を選ぶか、
  // あるいはdiff結果を手動編集させるなどのUIを提供できる
  // ここでは2つのCodeMirrorを並べてユーザーがコピー＆ペーストできるようにする簡易的な例を示す
  const [manualMergeContent, setManualMergeContent] = useState<string>("");

  useEffect(() => {
    // マージUIが開くたびに差分をもとに初期値を設定（今回はローカル版をデフォルトとする）
    setManualMergeContent(localContentOnConflict);
  }, [localContentOnConflict, conflict]);

  return (
    <CheckAuth>
      <Box gap={2} display="flex" flexDirection="column" alignItems="center">
        <TopBar />
        <Box width={"90%"}>
          <Divider />
        </Box>
        <Box width={"90%"} sx={{ maxWidth: "100%" }}>
          <CoolMo>
            <Card>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LuLayoutDashboard size={20} />
                  <Typography level="title-md">編集中</Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {activeUsers.map((uid) => (
                    <Box key={uid}>
                      <UserProfile uid={uid} />
                    </Box>
                  ))}
                  {activeUsers.length === 0 && (
                    <Typography level="body-sm">
                      編集している人はいません
                    </Typography>
                  )}
                </Box>
              </Box>
            </Card>

            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Badge
                color="danger"
                variant="solid"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                invisible={content === draftContent}
              >
                <CodeMirror
                  value={draftContent}
                  height="200px"
                  extensions={[javascript(), oneDark]}
                  onChange={(value) => setDraftContent(value)}
                />
              </Badge>

              <Typography level="body-sm" color="warning">
                ※
                複数人で同時に編集するとコンフリクトが発生する場合があります。  
                コンフリクトが発生した場合、マージUIが表示されます。
              </Typography>

              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  onClick={handleUpdate}
                  disabled={!user || content === draftContent}
                >
                  更新
                </Button>
              </Box>
            </Box>
          </CoolMo>
        </Box>

        {/* コンフリクト発生時のモーダル */}
        <Modal open={conflict} onClose={() => setConflict(false)}>
          <ModalDialog>
            <ModalClose />
            <Typography level="title-md">コンフリクトが発生しました</Typography>
            <Typography>
              他のユーザーが先に編集したため、あなたの編集内容と衝突しました。
            </Typography>
            <Typography mt={2}>サーバー側の最新バージョンとあなたのバージョンの差分:</Typography>
            <Box mt={1} sx={{ border: "1px solid #ccc", padding: "8px", borderRadius: "4px" }}>
              {renderDiffUI()}
            </Box>
            <Typography mt={2}>下記エディタでマージ結果を編集し、再度「マージして更新」ボタンを押してください。</Typography>
            <Box display="flex" gap={2} mt={2}>
              <Box flex={1}>
                <Typography level="body-sm">サーバー版</Typography>
                <CodeMirror
                  value={serverContentOnConflict}
                  height="200px"
                  extensions={[javascript(), oneDark]}
                  editable={false}
                />
              </Box>
              <Box flex={1}>
                <Typography level="body-sm">マージ結果(編集可能)</Typography>
                <CodeMirror
                  value={manualMergeContent}
                  height="200px"
                  extensions={[javascript(), oneDark]}
                  onChange={(value) => setManualMergeContent(value)}
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={() => handleMergeUpdate(manualMergeContent)}>マージして更新</Button>
              <Button variant="plain" onClick={() => setConflict(false)}>キャンセル</Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </CheckAuth>
  );
};

export default Whiteboard;
