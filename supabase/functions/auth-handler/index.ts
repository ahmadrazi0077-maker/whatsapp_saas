// Add to your existing auth-handler edge function

// Update Profile
if (path === '/update-profile' && req.method === 'PUT') {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })
    }

    const { name, email, phone, company, bio } = await req.json()

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        name, 
        email, 
        phone_number: phone,
        company,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.sub)
      .select('id, email, name, role, workspace_id, created_at')
      .single()

    if (error) throw error

    return new Response(JSON.stringify(user), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}

// Change Password
if (path === '/change-password' && req.method === 'POST') {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })
    }

    const { oldPassword, newPassword } = await req.json()

    // Get user with current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', payload.sub)
      .single()

    if (fetchError) throw fetchError

    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, user.password)
    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), { status: 401, headers })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', payload.sub)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}
