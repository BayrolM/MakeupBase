const fs = require('fs');

async function run() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.min.json");
    const json = await res.json();
    
    const mainCities = {};
    const departments = new Set();
    
    json.forEach(item => {
      const dep = item.departamento;
      departments.add(dep);
      if(!mainCities[dep]) mainCities[dep] = [];
      mainCities[dep] = item.ciudades;
    });

    const depsArray = Array.from(departments).sort();
    for (const dep in mainCities) {
      mainCities[dep].sort();
    }

    const fileContent = `export const colombianDepartments = ${JSON.stringify(depsArray)};\n\nexport const mainCities: Record<string, string[]> = ${JSON.stringify(mainCities, null, 2)};\n`;
    
    fs.writeFileSync('colombiaData.ts', fileContent);
    console.log("Written to colombiaData.ts with " + depsArray.length + " departments.");
  } catch (e) {
    console.error(e);
  }
}

run();
