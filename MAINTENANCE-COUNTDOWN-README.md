# Automatické ukončení údržby

Admin panel -> ÚDRŽBA: vyplň volitelný datum/čas, zapni údržbu. Pokud je údržba již zapnutá, změnu data uložíš tlačítkem ULOŽIT ČAS UKONČENÍ. Prázdné datum znamená ruční ukončení.

Datum se z prohlížeče odešle jako UTC ISO timestamp. V databázi se automaticky vytvoří sloupec `site_settings.ends_at` při prvním uložení přes administraci; nejsou potřeba ruční SQL migrace. Čas musí být alespoň 1 minutu a nejvýše 90 dní v budoucnu.

Po vypršení času middleware okamžitě propouští veřejné požadavky, aniž by bylo nutné provést cron nebo redeploy. Po vypršení času se odpočet návštěvníka přesměruje na hlavní stránku. V DB může zůstat `enabled=true`, ale systém počítá efektivní stav jako vypnutý, pokud `ends_at` již uplynul.

Pokud chceš vypnout údržbu ručně, stiskni VYPNOUT ÚDRŽBU. Nouzové vypnutí v Neon SQL editoru:
`UPDATE site_settings SET enabled=false, ends_at=NULL WHERE key='maintenance';`

Není implementován plánovaný začátek údržby, pouze její automatické ukončení.
