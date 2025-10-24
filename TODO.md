## Abgeschlossen / In Arbeit

### 2. KI-gestützte Logik- und Szenenerstellung [IN ARBEIT]
**Status:** Implementiert. Die KI analysiert das Projekt und schlägt proaktiv Szenen als umsetzbare Aktionen vor (z.B. "TV Abend").
**Problem:** Die App hilft bei der Erstellung von Gruppenadressen für einzelne Funktionen, aber die eigentliche Intelligenz im Smart Home entsteht durch die Verknüpfung dieser Funktionen (Szenen, Logik).
**Lösung:** Die KI analysiert das Projekt und schlägt proaktiv Szenen vor. Zum Beispiel:
"Ich sehe, Sie haben dimmbares Licht und Jalousien im Wohnzimmer. Möchten Sie eine Szene 'Fernsehabend' erstellen, die das Licht auf 20% dimmt und die Jalousien schließt?"
**Vorteil:** Der Benutzer denkt nicht mehr nur in einzelnen Adressen, sondern in ganzen Wohn-Szenarien. Die KI wird vom reinen "Datenerfasser" zum echten Planungsassistenten.

---

## Nächste Schritte

### 3. Konversationeller Projekt-Chat (KI Co-Pilot 2.0) [IN ARBEIT]
**Problem:** Man muss immer noch durch Menüs klicken und in Formulare tippen.
**Lösung:** Ein Chat-Fenster, in dem man der App einfach sagt, was sie tun soll. Zum Beispiel:
- "Füge in allen Schlafzimmern eine Heizung hinzu."
- "Benenne den Bereich 'EG' in 'Erdgeschoss' um und setze die Hauptgruppe auf 1."
- "Erstelle einen neuen Raum 'Büro' im Obergeschoss mit einem dimmbaren Licht und zwei Jalousien."
- "Welche Räume haben noch keine Heizungssteuerung?"
**Vorteil:** Die schnellste und intuitivste Art, ein Projekt zu erstellen. Man beschreibt das Ergebnis, und die KI erledigt die Detailarbeit.

---

## Zukünftige Ideen

### 4. Erweiterte Validierung und "Best Practice"-Prüfung
**Problem:** Die App prüft auf doppelte Hauptgruppen, aber nicht auf die Einhaltung von KNX-Best-Practices.
**Lösung:** Die KI könnte als permanenter "Gutachter" mitlaufen und Hinweise geben:
- "Warnung: Hauptgruppe 0 wird oft für zentrale Funktionen reserviert. Möchten Sie den Bereich 'Allgemein' auf eine andere HG verschieben?"
- "Vorschlag: Es ist üblich, Rückmelde-Objekte in einer separaten Mittelgruppe zu führen. Ich kann das für Ihre Licht-Funktionen einrichten."
**Vorteil:** Fehler werden vermieden, bevor sie entstehen, und die Qualität des Projekts steigt, da es sich an bewährten Standards orientiert.
