import { Project, GroupAddress } from '../../domain';
import { SCENE_MAIN_GROUP, CENTRAL_MAIN_GROUP } from '../config/constants';
import { escapeXml } from '../../shared/utils/xml';


export const generateXml = (gas: GroupAddress[], project: Project): string => {
    if (gas.length === 0) return '';
    
    // Dynamische Erstellung von Haupt- und Mittelgruppennamen für das XML
    const mainGroups: {[key: number]: string} = {};
    project.areas.forEach(a => { mainGroups[a.mainGroup] = a.name; });
    mainGroups[SCENE_MAIN_GROUP] = "Szenen";
    mainGroups[CENTRAL_MAIN_GROUP] = "Zentralfunktionen";

    const middleGroupNames: {[key: string]: string} = {};
    Object.values(project.deviceConfig).forEach(config => {
        middleGroupNames[String(config.middleGroup)] = config.description;
        if (config.feedbackMiddleGroup && config.feedbackMiddleGroup !== config.middleGroup) {
            middleGroupNames[String(config.feedbackMiddleGroup)] = `${config.description} - Rückmeldungen`;
        }
    });
    // Zentralfunktionen-Mittelgruppen
    middleGroupNames[`${CENTRAL_MAIN_GROUP}/0`] = "Allgemein";
    middleGroupNames[`${CENTRAL_MAIN_GROUP}/1`] = "Beschattung";
    
    const structuredGAs: {[main: string]: {[middle: string]: GroupAddress[]}} = {};
    gas.forEach(ga => {
        const [main, middle] = ga.address.split('/');
        if (!structuredGAs[main]) structuredGAs[main] = {};
        if (!structuredGAs[main][middle]) structuredGAs[main][middle] = [];
        structuredGAs[main][middle].push(ga);
    });

    // ETS Project XML Format
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<KNX xmlns="http://knx.org/xml/project/20">
  <Project ProjectName="${escapeXml(project.name)}">
    <Installations>
      <Installation InstallationName="Generated GAs">
        <GroupAddresses>
`;

    for (const mainKey of Object.keys(structuredGAs).sort((a,b) => Number(a) - Number(b))) {
        const mainName = mainGroups[Number(mainKey)] || `Hauptgruppe ${mainKey}`;
        xml += `          <GroupRange Name="${escapeXml(mainName)}">\n`;

        for (const middleKey of Object.keys(structuredGAs[mainKey]).sort((a,b) => Number(a) - Number(b))) {
            const fullMiddleKey = `${mainKey}/${middleKey}`;
            const middleName = middleGroupNames[middleKey] || middleGroupNames[fullMiddleKey] || `Mittelgruppe ${middleKey}`;
            xml += `            <GroupRange Name="${escapeXml(middleName)}">\n`;
            
            structuredGAs[mainKey][middleKey].forEach(ga => {
                const finalName = `${ga.name} ${ga.description}`;
                xml += `              <GroupAddress Name="${escapeXml(finalName)}" Address="${ga.address}" DPTs="${ga.dpt}" />\n`;
            });
            
            xml += `            </GroupRange>\n`;
        }
        xml += `          </GroupRange>\n`;
    }

    xml += `        </GroupAddresses>
      </Installation>
    </Installations>
  </Project>
</KNX>`;

    return xml;
};
