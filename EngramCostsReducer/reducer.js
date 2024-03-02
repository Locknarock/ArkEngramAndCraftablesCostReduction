const readline = require("readline");
const fs = require("fs");

const inputFileName = "engramsIngredientsDefault.json";
const outputFileName = "engramsIngredientsModified.json";
const overridesFileName = "Overrides.txt";

const fileContent = fs.readFileSync(inputFileName, "utf-8");

const jsonData = JSON.parse(fileContent);

const reduceIngredients = (json, percentage) => {
  if (percentage < 0 || percentage > 100) {
    console.log("Please enter a valid percentage between 0 and 100.");
    return;
  }

  const reductionFactor = percentage / 100;

  json.Items.forEach((item) => {
    item.Ingredients.forEach((ingredient) => {
      const key = Object.keys(ingredient)[0];
      const originalQuantity = ingredient[key];
      const reducedQuantity = Math.floor(originalQuantity * reductionFactor);
      ingredient[key] = reducedQuantity > 0 ? reducedQuantity : 1;
    });
  });

  return json;
};

const generateOverridesFile = (json) => {
  const overrideStrings = json.Items.map((item) => {
    const itemClassString = item.Engram;
    const resourceRequirements = item.Ingredients.map((ingredient) => {
      const resourceItemTypeString = Object.keys(ingredient)[0];
      const baseResourceRequirement = ingredient[resourceItemTypeString];
      return `(ResourceItemTypeString="${resourceItemTypeString}",BaseResourceRequirement=${baseResourceRequirement}.0,bCraftingRequireExactResourceType=false)`;
    });

    const overrideString = `ConfigOverrideItemCraftingCosts=(ItemClassString="${itemClassString}",BaseCraftingResourceRequirements=(${resourceRequirements.join(
      ","
    )}))`;

    return overrideString;
  });

  fs.writeFileSync(overridesFileName, overrideStrings.join("\n"));
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter a percentage to reduce ingredients: ", (percentage) => {
  rl.close();

  percentage = parseFloat(percentage);

  if (isNaN(percentage)) {
    console.log("Please enter a valid number.");
    return;
  }

  const reducedJson = reduceIngredients(jsonData, percentage);

  fs.writeFileSync(outputFileName, JSON.stringify(reducedJson, null, 2));

  console.log(`Modified JSON written to ${outputFileName}`);

  generateOverridesFile(reducedJson);

  console.log(`Overrides.txt file generated.`);
});
