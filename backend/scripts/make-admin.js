/**
 * Script pour promouvoir un utilisateur en admin
 * Usage: node scripts/make-admin.js <email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin(email) {
  if (!email) {
    console.error('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}...`);

  // Find user by email
  const { data: user, error: findError } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('email', email)
    .single();

  if (findError || !user) {
    console.error('User not found:', findError?.message || 'No user with this email');
    
    // List all users
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('email, role')
      .limit(10);
    
    if (allUsers?.length) {
      console.log('\nAvailable users:');
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    }
    
    process.exit(1);
  }

  console.log(`Found user: ${user.first_name} ${user.last_name} (${user.email})`);
  console.log(`Current role: ${user.role}`);

  if (user.role === 'admin') {
    console.log('User is already an admin!');
    process.exit(0);
  }

  // Update role to admin
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating role:', updateError.message);
    process.exit(1);
  }

  console.log(`\n? Success! ${user.email} is now an admin.`);
  console.log('Please log out and log back in for changes to take effect.');
}

// Get email from command line
const email = process.argv[2];
makeAdmin(email);
