import jwt from 'jsonwebtoken';

// Middleware opcional para autenticación. 
// Si hay token, lo verifica y asigna req.user. 
// Si no hay token, permite el acceso pero NO asigna req.user.
export const authOptional = (req, res, next) => {
  console.log('🔓 [AuthOptional] Verificando token (opcional)...');

  // Si no hay header Authorization, permitir acceso sin usuario
  if (!req.headers.authorization) {
    console.log('ℹ️ Sin token - acceso público permitido');
    return next();
  }

  try {
    // Extraer el token del header Authorization
    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('⚠️ Formato de token inválido - acceso público permitido');
      return next();
    }

    const token = parts[1];
    if (!token) {
      console.log('ℹ️ Token vacío - acceso público permitido');
      return next();
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido asignado a req.user');
    
    // Asignar el usuario si el token es válido
    req.user = decoded;
    next();
  } catch (error) {
    // Si el token es inválido pero existe, permitir acceso público
    console.log('⚠️ Token inválido - acceso público permitido');
    next();
  }
};