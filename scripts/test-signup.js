import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://bapulrkwjnxjhizxmqmx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHVscmt3am54amhpenhtcW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM0ODcsImV4cCI6MjA3ODk1OTQ4N30.jBTj37zLxHn7vdmsJ3g5YAnGoGErF7oTT1gdizM0EHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupRPC() {
    console.log('Testing upsert_user_profile RPC...');

    const dummyId = '00000000-0000-0000-0000-000000000000';

    const profileData = {
        id: dummyId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        ghana_pincode: '12345', // This is the column we are testing
        role: 'student'
    };

    try {
        const { data, error } = await supabase.rpc('upsert_user_profile', {
            profile_data: profileData
        });

        if (error) {
            fs.writeFileSync('error.log', JSON.stringify(error, null, 2));
            console.log('Error written to error.log');

            if (error.message && error.message.includes('ghana_pincode')) {
                console.log('❌ Error confirms ghana_pincode column issue is present.');
            } else if (error.message && error.message.includes('foreign key constraint')) {
                console.log('✅ RPC executed! It failed on FK constraint (expected), which means the column likely exists.');
            } else {
                console.log('⚠️  RPC failed with unrelated error:', error.message);
            }
        } else {
            console.log('✅ RPC executed successfully!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testSignupRPC();
