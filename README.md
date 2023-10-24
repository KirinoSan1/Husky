# Husky

## Projektname

Das Projekt heißt "Husky".

## Projektbeschreibung

Im Rahmen des Projektes wird ein Diskussionsforum für den
Wissensaustausch umgesetzt. Die Nutzer können auf klassische Art
Posts in Threads verfassen oder sich über eine Live-Chat Funktion
direkt miteinander austauschen. Das Forum wird von entsprechenden
Akteuren moderiert und administriert. Die Nutzer können fachliche
Diskussionen führen sowie konkrete Fragen stellen und beantworten.

Nutzer, die beispielsweise vor dem Kauf eines Autos stehen, können im Forum Fragen zu verschiedenen Modellen, Preisen und Eigenschaften stellen. Andere Nutzer können daraufhin ihre Empfehlungen, basierend auf eigenen Kenntnissen und Erfahrungen mitteilen.

## Teammitglieder

- Alexander Suesskind (UI/UX, Frontend)
    - Matrikelnummer: 933780
    - E-Mail: s87424@bht-berlin.de
- Can Pala (UI/UX, Backend)
    - Matrikelnummer: 938092
    - E-Mail: s88011@bht-berlin.de
- Dominik Henning (Maintainer, Frontend, Schnittstelle Client/Server)
    - Matrikelnummer: 934954
    - E-Mail: s88126@bht-berlin.de
- Maximilian Diek (UML-Diagramme, Frontend, Schnittstelle Client/Server)
    - Matrikelnummer: 928836
    - E-Mail: s87999@bht-berlin.de
- Mohammad Hammad (Backend)
    - Matrikelnummer: 929184
    - E-Mail: s88475@bht-berlin.de
- Umut Can Aydin (Backend)
    - Matrikelnummer: 929104
    - E-Mail: s87720@bht-berlin.de

## Tech-Stack

### Allgemein
- JavaScript / TypeScript
- Node.js

### Frontend
- React
- Sass

### Backend
- Express.js
- HTML WebSockets
- Mongoose
- MongoDB

### Testing
- Jest
- Selenium oder Playwright

## Erste Schritte

### Anforderungsanalyse

Um die Anforderungen an unsere Anwendung zu ermitteln wird ein Use-Case-Diagramm erstellt.

Des Weiteren wird die Struktur der Anwendung anhand eines Klassendiagramms skizziert.

Basierend auf dem Klassendiagramm werden Tickets für die Implementierung ausgearbeitet.

Parallel dazu werden die Projekte für Frontend und Backend im GitLab aufgesetzt.

## Tools

Das Use-Case-Diagramm und das Klassendiagramm werden mit draw.io erstellt.

Als Entwicklungsumgebung wird Visual Studio Code oder ggf. WebStorm verwendet.

Für die Visualisierung der Daten aus der Datenbank soll MongoDB Compass verwendet werden.

## Verzeichnisstruktur

Es gibt einen Ordner "frontend", in dem sich sämtliche Quellcodedateien und Tests für das Frontend befinden.

Es gibt einen Ordner "backend", in dem sich sämtliche Quellcodedateien und Tests für das Backend befinden.

In beiden Ordnern gibt es jeweils zwei Unterordner mit dem Namen "src" und "test". In "src" befinden sich die Quellcodedateien, in "test" befinden sich die Tests.

## Coding-Standards

Im Wesentlichen halten wir uns an die Java-Code-Conventions:<br>
https://www.oracle.com/java/technologies/javase/codeconventions-introduction.html

Außerdem verwenden wir das Prinzip der Guard Clauses, um den Code möglichst von überflüssigen Schachtelungen zu befreien:<br>
https://en.wikipedia.org/wiki/Guard_(computer_science)
