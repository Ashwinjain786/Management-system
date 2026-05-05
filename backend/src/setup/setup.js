require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');

    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'IDURAR',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    let result = await Admin.findOne({ email: demoAdmin.email });
    if (!result) {
      result = await new Admin(demoAdmin).save();
    }

    const passwordExists = await AdminPassword.findOne({ user: result._id });
    if (!passwordExists) {
      const newAdminPassword = new AdminPassword();
      const salt = uniqueId();
      const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

      const AdminPasswordData = {
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: result._id,
      };
      await new AdminPassword(AdminPasswordData).save();
    }

    console.log('👍 Admin created : Done!');

    const Setting = require('../models/coreModels/Setting');

    const settingFiles = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    for (const setting of settingFiles) {
      await Setting.updateOne(
        { settingKey: setting.settingKey },
        { $setOnInsert: setting },
        { upsert: true }
      );
    }

    console.log('👍 Settings created : Done!');

    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');

    await Taxes.updateOne(
      { taxName: 'Tax 0%' },
      { $setOnInsert: { taxName: 'Tax 0%', taxValue: 0, isDefault: true } },
      { upsert: true }
    );
    console.log('👍 Taxes created : Done!');

    await PaymentMode.updateOne(
      { name: 'Default Payment' },
      {
        $setOnInsert: {
          name: 'Default Payment',
          description: 'Default Payment Mode (Cash , Wire Transfer)',
          isDefault: true,
        },
      },
      { upsert: true }
    );
    console.log('👍 PaymentMode created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
