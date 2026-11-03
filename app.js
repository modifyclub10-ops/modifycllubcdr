
const SUPABASE_URL = 'https://axwqvydjcceahaulupax.supabase.co';

const SUPABASE_KEY = 'sb_publishable_cVnafI3dTnjY-5b3_P4iVQ_x5l79Akk';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById('joinForm');
const note = document.getElementById('note');

form.addEventListener('submit', async function(event) {
  event.preventDefault();

  const name = form.elements['name'].value.trim();
  const phone = form.elements['phone'].value.trim();
  const reference = form.elements['reference'].value.trim();

  if (!name || !phone || !reference) {
    note.textContent = 'Please fill in all fields.';
    return;
  }

  const button = form.querySelector('button[type="submit"]');

  button.disabled = true;
  button.textContent = 'Submitting...';
  note.textContent = 'Please wait...';

  try {
    const { error } = await supabaseClient
      .from('payment_submissions')
      .insert({
        full_name: name,
        whatsapp_number: phone,
        method: 'jazzcash',
        transaction_reference: reference,
        amount_pkr: 1000,
        status: 'pending'
      });

    if (error) {
      throw error;
    }

    note.textContent =
      'Your request has been submitted! Payment is waiting for admin approval.';

    form.reset();

  } catch (error) {
    console.error('Submission error:', error);

    note.textContent = 'Error: ' + error.message;

  } finally {
    button.disabled = false;
    button.textContent = 'Submit Membership Request';
  }
});

console.log('Modify Club: Ready!');
