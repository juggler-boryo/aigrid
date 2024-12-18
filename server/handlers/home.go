package handlers

import "net/http"

func CheckToyuHealthHandler(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("http://14.9.49.192:28001/health")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
		return
	}
}

func TriggerToyuHandler(w http.ResponseWriter, r *http.Request) {
	// port forwardした灯油ストーブのサーバーにアクセス
	// ここで敢えてaigridを挟んでいるのは、proxyとして扱いたかったから
	// http -> https に変換している
	// あとは抽象化
	resp, err := http.Get("http://14.9.49.192:28001/")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
		return
	}

	http.Error(w, "Failed to trigger toyu", resp.StatusCode)

}
