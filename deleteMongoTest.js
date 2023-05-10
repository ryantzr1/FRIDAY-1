const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;

async function deleteTest(modelName, query) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const Model = mongoose.model(modelName);

  const FRIDAYTestUsers = [86028224, 86025057, 85788878];
  const updatedQuery = { ...query, userId: { $in: FRIDAYTestUsers } };
   
  
  try {
    const result = await Model.deleteMany(updatedQuery);
    console.log(`Deleted ${result.deletedCount} items`);
    return result.deletedCount;
  } catch (err) {
    console.error("Error deleting items:", err);
  } finally {
    await mongoose.connection.close();
  }
}

module.exports = deleteTest;
