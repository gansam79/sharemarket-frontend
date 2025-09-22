import "dotenv/config";
import { connectDB } from "./db.js";
import DmatAccount from "./models/DmatAccount.js";
import Shareholder from "./models/Shareholder.js";

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  await connectDB();
  await DmatAccount.deleteMany({});
  await Shareholder.deleteMany({});

  const names = [
    "Alice Johnson","Bob Smith","Carol Davis","David White","Eva Brown","Frank Miller",
    "Grace Wilson","Henry Taylor","Ivy Anderson","Jack Thomas","Karen Moore","Liam Martin"
  ];

  const accounts = [];
  for (let i = 0; i < 12; i++) {
    const name = names[i % names.length];
    const acc = await DmatAccount.create({
      accountNumber: `DMAT${1001 + i}`,
      holderName: name,
      expiryDate: new Date(new Date().getFullYear() + 1, 11, 31),
      renewalStatus: pick(["Active", "Expired", "Pending", "Expiring"]),
    });
    accounts.push(acc);
  }

  const types = ["Shareholder", "Stockholder"];
  for (let i = 0; i < 20; i++) {
    const name = names[(i * 3) % names.length];
    await Shareholder.create({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: `98${String(76543210 + i).padStart(8, "0")}`,
      pan: `ABCDE${String(1234 + i)}F`,
      type: pick(types),
      linkedDmatAccount: pick(accounts)._id,
    });
  }

  console.log("✅ Seeding complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
