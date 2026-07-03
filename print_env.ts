console.log('Environment variables:');
for (const key of Object.keys(process.env)) {
  if (key.includes('FIREBASE') || key.includes('GOOGLE') || key.includes('GCP') || key.includes('PROJECT') || key.includes('DB') || key.includes('PORT')) {
    console.log(`${key}=${process.env[key]}`);
  }
}
