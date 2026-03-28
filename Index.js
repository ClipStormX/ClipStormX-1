const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const crypto = require('crypto');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Store users temporarily
let users = {};

// Generate unique code
function generateCode() {
  return crypto.randomBytes(3).toString('hex');
}

// Register command
const commands = [
  new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your social media')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your username')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Platform (TikTok, YouTube)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your account')
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Handle commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'register') {
    const username = interaction.options.getString('username');
    const platform = interaction.options.getString('platform');

    const code = generateCode();

    users[interaction.user.id] = {
      username,
      platform,
      code,
      verified: false
    };

    await interaction.reply({
      content:
`✅ Registered!

📱 Platform: ${platform}
👤 Username: ${username}

🔑 Your Verification Code:
👉 ${code}

📌 Put this code in your bio and run /verify`,
      ephemeral: true
    });
  }

  if (interaction.commandName === 'verify') {
    const user = users[interaction.user.id];

    if (!user) {
      return interaction.reply({ content: "❌ Register first using /register", ephemeral: true });
    }

    // Manual verification step
    user.verified = true;

    await interaction.reply({
      content: `✅ Verified! (Manual check required by admin)`,
      ephemeral: true
    });
  }
});

client.login(TOKEN);
