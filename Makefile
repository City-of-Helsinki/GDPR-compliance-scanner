PHONY :=

PHONY += shell
shell:
	@docker compose exec app bash

PHONY += install
install: up
	docker compose exec app bash -c "npm install"

PHONY += up
up:
	docker compose up --pull always -d

PHONY += stop
stop:
	docker compose stop

PHONY += down
down:
	docker compose down -v

PHONY += run
run:
	docker compose exec app bash -c "xvfb-run npm start"

.PHONY: $(PHONY)
