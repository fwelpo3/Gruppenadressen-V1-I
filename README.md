# KNX GA-Generator Pro

Ein professionelles Werkzeug zur Erstellung und Verwaltung von KNX-Gruppenadressen nach offiziellen Richtlinien.

## Projektstruktur

Dieses Projekt wurde basierend auf einer Feature-Sliced-Architektur umstrukturiert, um die Wartbarkeit und Skalierbarkeit zu verbessern. Die Codebasis ist nun nach fachlichen Domänen (Features) und nicht mehr nach technischen Layern organisiert.

- **`/app`**: Der Einstiegspunkt der Anwendung und die Haupt-Kompositions-Wurzel.
- **`/context`**: Globale React Contexts für das State Management (z.B. `ProjectContext`, `ToastContext`).
- **`/domain`**: Die Kern-Geschäftslogik und die Typ-Definitionen des Projekts. Dieser Teil ist UI-agnostisch.
- **`/adapters`**: Implementierungen für externe Schnittstellen, wie z.B. Exporte (CSV), Konfigurationen und Local Storage-Persistenz.
- **`/features`**: Einzelne, in sich geschlossene Features der Anwendung. Jedes Feature enthält seine eigenen Komponenten und ggf. Hooks.
    - `/ai-assistant`: Der KI-Assistent zur Projektgenerierung und -analyse.
    - `/dashboard`: Die Hauptansicht mit Aktions- und Vorschau-Panels.
    - `/settings`: Das Einstellungs-Panel.
    - `/structure-editor`: Der Kern-Editor zur Verwaltung von Bereichen und Räumen.
- **`/shared`**: Wiederverwendbare Komponenten (`/ui`), Utilities (`/utils`) und andere übergreifende Module.

## Zukünftige Verbesserungen

Basierend auf der Analyse wurden weitere potenzielle Verbesserungsbereiche identifiziert, die für die Zukunft vorgemerkt sind:

- **Internationalisierung (i18n):** Aktuell sind alle Texte auf Deutsch hartcodiert. Die Einführung eines i18n-Frameworks würde die Mehrsprachigkeit ermöglichen.
- **Flexiblere `DeviceConfig`:** Die Definition von `FunctionType` ist derzeit statisch im Code verankert. Eine dynamischere Konfiguration könnte die Erweiterbarkeit um neue Gewerke erleichtern.
- **Testabdeckung:** Die Implementierung von Unit- und Integrationstests würde die Stabilität des Projekts bei zukünftigen Änderungen sicherstellen.
