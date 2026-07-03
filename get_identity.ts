async function getServiceAccount() {
  try {
    const res = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email', {
      headers: { 'Metadata-Flavor': 'Google' }
    });
    if (res.ok) {
      const email = await res.text();
      console.log('Service Account Email:', email);
    } else {
      console.error('Metadata server returned status:', res.status);
    }
  } catch (err: any) {
    console.error('Failed to get service account:', err.message);
  }
}

getServiceAccount();
