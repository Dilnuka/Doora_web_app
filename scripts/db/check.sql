SELECT r.code, r.name, u.name as guest_name, u.email as guest_email, u.role 
FROM "Room" r 
LEFT JOIN "User" u ON u."roomId" = r.id 
ORDER BY r.code;
