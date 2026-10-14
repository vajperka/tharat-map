# Import dat přímo do hlavní mapy / Native map import

Souřadnice z jednorázového skenu serveru se nyní vykreslují přímo na hlavní mapě bez samostatného přepínače. Používají stávající kategorie (Dinosauři, Ropné žíly, Artefakty, Loot) a novou kategorii Oblasti spawnu beden. Detail se otevírá kliknutím na bod a vzhled využívá existující detail panel.

Data zůstávají v `public/official-tharat-locations.json`, nedochází k zápisu do databáze ani k vydávání skenu za komunitní, adminem ověřené markery. Sken obsahuje dynamické polohy tvorů, nikoli zaručené spawny. Použita stávající kalibrace LAT/LON.

EN: One-time server scan rendered in native map filters and detail layout; no separate scan toggle, no DB migration.
