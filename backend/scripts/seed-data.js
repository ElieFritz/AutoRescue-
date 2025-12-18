/**
 * Script de seed simplifie - login puis creation des donnees
 */

const API_URL = 'http://localhost:3001/api/v1';

async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.accessToken;
  }
  return null;
}

async function createVehicle(token, vehicleData) {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(vehicleData),
  });
  
  const data = await response.json();
  console.log('Vehicle response:', response.status, JSON.stringify(data));
  return response.ok;
}

async function createGarage(token, garageData) {
  const response = await fetch(`${API_URL}/garages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(garageData),
  });
  
  const data = await response.json();
  console.log('Garage response:', response.status, JSON.stringify(data));
  return response.ok;
}

async function main() {
  console.log('?? Connexion aux comptes existants...\n');

  // Login motorist
  const motoristToken = await login('motorist@test.cm', 'Test123!');
  if (motoristToken) {
    console.log('? motorist@test.cm connecte');
    
    // Creer vehicules
    console.log('\n?? Creation de vehicules...');
    await createVehicle(motoristToken, {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      license_plate: 'LT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      color: 'Blanc',
      vehicle_type: 'car',
      is_default: true
    });
  } else {
    console.log('? Impossible de connecter motorist@test.cm');
  }

  // Login garage
  const garageToken = await login('garage@test.cm', 'Test123!');
  if (garageToken) {
    console.log('\n? garage@test.cm connecte');
    
    // Creer garage
    console.log('\n?? Creation de garage...');
    await createGarage(garageToken, {
      name: 'Garage Central Douala',
      description: 'Garage multi-marques',
      address: 'Rue de la Joie, Akwa, Douala',
      latitude: 4.0511,
      longitude: 9.7679,
      phone: '+237699001122',
      email: 'contact@garagecentral.cm',
      services: ['Mecanique generale', 'Electricite auto'],
      specialties: ['Toyota', 'Honda'],
      diagnostic_fee: 5000,
      travel_fee_per_km: 500
    });
  } else {
    console.log('? Impossible de connecter garage@test.cm');
  }

  console.log('\n? Termine!');
}

main().catch(console.error);
