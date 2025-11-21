export const testBackendConnection = async () => {
  try {
    console.log('Probando conexión al backend...');
    
    // Probar endpoint de salud
    const response = await fetch('https://backend-gym-5.vercel.app/api/health');
    console.log('Health check status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Health check response:', data);
    }
    
    // Probar endpoint de usuarios para ver qué hay disponible
    const usersResponse = await fetch('https://backend-gym-5.vercel.app/api/users');
    console.log('Users endpoint status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users available:', usersData);
    }
    
    return true;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
};

export const createTestUsers = async () => {
  try {
    console.log('Intentando crear usuarios de prueba...');
    
    const testUsers = [
      {
        email: 'member@gym.com',
        password: '123456',
        firstName: 'Member',
        lastName: 'Test',
        role: 'MEMBER'
      },
      {
        email: 'trainer@gym.com', 
        password: '123456',
        firstName: 'Trainer',
        lastName: 'Test',
        role: 'TRAINER'
      },
      {
        email: 'admin@gym.com',
        password: '123456', 
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN'
      }
    ];
    
    for (const user of testUsers) {
      try {
        const response = await fetch('https://backend-gym-5.vercel.app/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
        
        console.log(`Creando usuario ${user.email}: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Usuario ${user.email} creado:`, data);
        } else {
          const error = await response.text();
          console.log(`Error creando ${user.email}:`, error);
        }
      } catch (error) {
        console.error(`Error con usuario ${user.email}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error creando usuarios de prueba:', error);
  }
};