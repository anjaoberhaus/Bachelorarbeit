# Visualisierung des Wärmeinseleffektes in Münster

In diesem GitHub-Repository befinden sich alle Quellcodes und Messdaten, die im Rahmen der Bachelorarbeit zum Thema "Visualisierung des Wärmeinseleffektes mit Hilfe der senseBox: Einbindung in den Bildungskontext und Evaluierung" verwendet wurden.

## Code für die senseBox zum Speichern auf SD-Karte (Arduino)

Der Code für die senseBox wurde zunächst über [Blockly](https://blockly.sensebox.de/ardublockly/?lang=de&board=sensebox-mcu) zum Speichern der Messdaten auf der SD-Karte programmiert. Da es über Blockly allerdings nicht möglich ist, die GPS-Daten mit mehr als zwei Nachkommastellen abzuspeichern, wurde der Programmcode mit Arudino an zwei Stellen verändert. Der fertige Programmcode sieht [so](https://github.com/anjaoberhaus/Bachelorarbeit/blob/master/senseBox/Messung_auf_SD.ino) aus. Für mehr Nachkommastellen wurden in den Zeilen 61 und 62 lediglich ein Komma und eine 5 in den Klammern wie folgt ergänzt:

    dataFile19_08_06.println(gps.getLatitude(),5);
    dataFile19_08_06.println(gps.getLongitude(),5);
    
Nach der Fertigstellung des Codes musste er lediglich als bin-Datei kompiliert werden.

## Animation

Für die [Animation des Wärmeinseleffektes](https://anjaoberhaus.github.io/Bachelorarbeit/Animation) in Form von Linien auf einer Karte wurde der [Code von Joey K. Lee](https://github.com/joeyklee/meteobike-animation), der für die Visualisierung des [Meteobike-Projektes](https://github.com/achristen/Meteobike) programmiert wurde, als Vorlage genommen. Dieser besteht aus einer HTML-, einer JavaScript-, einer CSS- und einer CSV-Datei, die im folgenden näher erläutert werden.

### HTML-Datei

Die [HTML-Datei](https://github.com/anjaoberhaus/Bachelorarbeit/blob/master/Animation/index.html) enthält vor allem Metainformationen über die Karte. Darin kann man den Titel, die Beschreibung, den Autor der Seite, notwendige Karteninformationen und die Variablen, die angezeigt werden können sollen, anpassen.

Für erstere Änderungen muss man also lediglich in den Zeilen 5, sowie 8-10 die Informationen austauschen:

    <title>Wärmeinseleffekt Münster</title>

    <meta name="description" content="Visualisierung des Wärmeinseleffektes in Münster">
    <meta name="keywords" content="Wärmeinseleffekt, Temperaturmessungen, Münster">
    <meta name="author" content="Anja Oberhaus">
    
 Die Karteninformationen, die über der Legender erscheinen sollen, kann man in den Zeilen 23-26 anpassen:
 
            <p><b>Visualisierung des Wärmeinseleffektes in Münster</b>
                <br>Mit Hilfe der <a href="https://sensebox.de/" target="_empty">senseBox</a> wurden Temperaturmessungen in Münsteraner Innen- und Außenstadtbezirken unternommen.
                <br>
                <small>Quellcode der Animation angelehnt an <a href="https://github.com/joeyklee/meteobike-animation">Joey K. Lee</a> </small>
    
Außerdem muss man noch die Datein auswählen, aus denen die Karte die Informationen ziehen soll. Die werden im Quellcode als "Kampagnen" (bzw. im englischen "campaign") bezeichnet und können in den Zeilen 29-32 angepasst werden:

        <div id="campaignSelector">
            <select id="campaign">
                <option value="2019-08-06" selected>06. August 2019 19:00</option>
            </select>
    
Hinter dem "value=" sollte also in den Anführungszeichen der Titel der jeweiligen CSV-Datei stehen. Dahinter in den spitzen Klammern steht der Text, mit dem die Kampagne benannt werden sollen. Möchte man die Daten aus mehr als einer CSV-Datei importieren, so kann man dies tun, indem man Zeile 31 einfach kopiert und direkt dadrunter (beliebig oft) einfügt und anpasst. Das "selected" sollte allerdings nur in der Zeile stehen, deren Daten beim Öffnen der Website zuerst angezeigt werden sollen.

Ähnliches gilt für die Variablen, die mit der Karte angezeigt werden können sollen. Diese lassen sich in den Zeilen 34-37 anpassen:

        <div id="variableSelector">
            <select id="variables">
                <option value="Temperature_diff_K" selected>Temperaturdifferenz (°C)</option>
            </select>
           
Hinter dem "value=" müssen an dieser Stelle die Spaltentitel der Daten stehen, die angezeigt werden sollen. Dahinter in den spitzen Klammern steht der Text, mit dem die Variablen benannt werden sollen. Auch hier können mehrere Variablen aufgeführt werden, aber nur eine darf das "selected" enthalten.

### JavaScript-Datei

In der [JavaScript-Datei](https://github.com/anjaoberhaus/Bachelorarbeit/blob/master/Animation/js/main.js) können Start- und Endzeit der Animation, Klassifizierung der Daten und das Zentrum der Karte beim Laden der Website ausgewählt werden. Außerdem müssen auch hier die anzuzeigenden Kampagnen und Variablen angepasst werden.

Die Start- und Endzeit müssen in den Zeilen 46-47 angepasst werden.

            startTime = Date.parse('2019-08-06T17:00:00.000Z');
            endTime = Date.parse('2019-08-06T18:00:00.000Z');
            
Diese müssen in der Klammer im UTC-Format stehen, damit sie gelesen werden können.

In den Zeilen 68-87 können die Eigenschaften der Linie verändert werden:

                'line-width': 3,
                'line-color': {
                    "property": selectedVariable,
                    "stops": [
                        [-1.4, "#003FD6"],
                        [-1.2, "#0069D7"],
                        [-1.0, "#0095D9"],
                        [-0.8, "#00C2DB"],
                        [-0.6, "#00DDCB"],
                        [-0.4, "#00DFA1"],
                        [-0.2, "#00E176"],
                        [0, "#00E51E"],
                        [0.2, "#3BE800"],
                        [0.4, "#99EC00"],
                        [0.6, "#F0E600"],
                        [0.8, "#F2B800"],
                        [1, "#F48A00"],
                        [1.2, "#F65A00"],
                        [1.4, "#F82A00"],
                        [1.6, "#F90006"]
                        
Hier hat man also die Möglichkeit, zum einen die Dicke der Linie anzupassen, als auch die Klassifizierung. Für letztere sollte man für seine Daten eine Klassifikation vornehmen, die man hier übernehmen möchte. Dazu schreibt man in die eckigen Klammern auf die linke Seite also den Wert der Klasse hin, und auf die rechte seite die Farbe, mit der die Klasse angezeigt werden soll. Die Farben müssen dabei im Hex Color Code angegeben werden. Im Internet gibt es Seiten, die einem einen Farbverlauf in beliebig vielen Unterteilungen in diesem Format ausgeben, sodass man die Farben nicht per Hand wählen muss.

In den Zeilen 150-152 muss man die Zeiten für seine Kampagnen auswählen:

                if (selectedCampaign === '2019-08-06') {
                    startTime = Date.parse('2019-08-06T17:00:00.000Z');
                    endTime = Date.parse('2019-08-06T18:00:00.000Z');
                    
In der oberen Zeile gibt man also wieder den Dateinamen der jeweiligen CSV-Datei an und in den beiden unteren Zeilen die Start- und Endzeit im UTC-Format.

Das Zentrum der Karte beim Laden der Website kann man in den Zeilen 221-222 anpassen:

                center: [7.625960, 51.962497], // initial map center in [lon, lat]
                zoom: 11.5
                
In der oberen Zeile gibt man somit die Koordinaten des Zentrums ein und in der unteren den Zoomfaktore, der bestimmt, wie groß der Kartenausschnitt ist, der angezeigt wird.

In den Zeilen 248-253 werden die Daten aus der CSV-Datei gelesen. Hier sollte man also die entsprechenden Daten in das folgende Format bringen:

                    System_ID: d.System_ID,
                    Time_UTC: Date.parse(d.Time_UTC),
                    Altitude: +d.Altitude,
                    Latitude: +d.Latitude,
                    Longitude: +d.Longitude,
                    Temperature_diff_K: +d.Temperature_diff_K
                    
### CSS-Datei

In der [CSS-Datei](https://github.com/anjaoberhaus/Bachelorarbeit/blob/master/Animation/styles/main.css) wird das Layout der Karte formatiert. Änderungen sind hier zwar möglich, aber nicht zwingend notwendig.

### CSV-Datei

In der oder den [CSV-Datei(n)](https://github.com/anjaoberhaus/Bachelorarbeit/blob/master/Animation/data/2019-08-06.csv) müssen alle Daten, die für die Karte benötigt werden, enthalten sein. Diese Datei könnte beispielsweise wie folgt aussehen:

| Latitude | Longitude | System_ID | unit | value | Time_UTC | Temperature_diff_K |
| --------- | --------- | --- | --- | ---- | -------------- | --- |
| 51,96257 | 7,62592 | 1 | °C | 23,87 | 2019-08-06T17:00:00,000Z | 1,1 |
| ... | ... | ... | ... | ... | ... | ... |

Wichtig sind vor allem die Breiten- und Längengrade, sowie die Zeiten der Messwerte. Außerdem sollten die verschiedenen Variablen enthalten sein. Falls man mehr als eine Linie auf der Karte darstellen möchte, muss jeder Linie einen "System_ID" zugeordnet werden.
