import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bapulrkwjnxjhizxmqmx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHVscmt3am54amhpenhtcW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM0ODcsImV4cCI6MjA3ODk1OTQ4N30.jBTj37zLxHn7vdmsJ3g5YAnGoGErF7oTT1gdizM0EHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
    console.log('Verifying profiles table schema...');

    try {
        // Try to select the specific column
        const { data, error } = await supabase
            .from('profiles')
            .select('ghana_pincode')
            .limit(1);

        if (error) {
            console.error('Error checking column:', error.message);
            if (error.message.includes('does not exist')) {
                console.log('❌ Column ghana_pincode DOES NOT exist in profiles table.');
            } else {
                console.log('⚠️  Unexpected error. The column might exist but there are other issues.');
            }
        } else {
            console.log('✅ Column ghana_pincode exists in profiles table.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verifySchema();
