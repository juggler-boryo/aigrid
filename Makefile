.PHONY: run

run:
	@trap 'kill 0' SIGINT SIGTERM; \
	cd app && yarn dev & \
	cd server && make run & \
	wait
