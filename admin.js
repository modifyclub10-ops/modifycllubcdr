const SUPABASE_URL = 'https://axwqvydjcceahaulupax.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cVnafI3dTnjY-5b3_P4iVQ_x5l79Akk';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const message = document.getElementById('message');
const requests = document.getElementById('requests');

const loginButton = document.getElementById('loginButton');
const refreshButton = document.getElementById('refreshButton');
const logoutButton = document.getElementById('logoutButton');

function showMessage(text) {
  message.textContent = text;
}

function showDashboard() {
  loginSection.classList.add('hidden');
  dashboard.classList.remove('hidden');
}

function showLogin() {
  dashboard.classList.add('hidden');
  loginSection.classList.remove('hidden');
}

async function checkAdmin() {
  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;

  if (!user) {
    showLogin();
    return false;
  }

  const { data, error } = await supabaseClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    await supabaseClient.auth.signOut();
    showLogin();
    throw new Error('This account is not an authorized admin.');
  }

  showDashboard();
  return true;
}

// ==========================================
// NAYA FUNCTION: Expiring Tomorrow Members
// ==========================================
async function loadExpiringMembers() {
  const expiringBody = document.getElementById('expiring-body');
  if (!expiringBody) return;

  // Agle 24 ghante ka time nikal rahe hain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabaseClient
    .from('memberships')
    .select('*')
    .lte('expires_at', tomorrow.toISOString())
    .gte('expires_at', new Date().toISOString());

  if (error || !data || data.length === 0) {
    expiringBody.innerHTML = '<tr><td colspan="3">Koi membership expire nahi ho rahi kal.</td></tr>';
    return;
  }

  expiringBody.innerHTML = '';
  
  data.forEach((member) => {
    const tr = document.createElement('tr');
    
    // Agar WhatsApp number mein +92 ya 0 na ho, to handle karna
    let waNumber = member.whatsapp_number;
    if (waNumber.startsWith('0')) {
        waNumber = '92' + waNumber.slice(1); // 0300... ko 92300... banayega
    }

    tr.innerHTML = `
      <td>${member.full_name || 'N/A'}</td>
      <td>${member.whatsapp_number}</td>
      <td>
        <a href="https://wa.me/${waNumber}?text=Assalam%20o%20Alaikum%20${member.full_name},%20aapki%20membership%20kal%20expire%20ho%20rahi%20hai.%20Please%20renew%20karein." target="_blank" class="wa-btn">
          Message
        </a>
      </td>
    `;
    expiringBody.appendChild(tr);
  });
}
// ==========================================


async function loadRequests() {
  requests.replaceChildren();
  showMessage('Loading payment requests...');

  // Expiring members ko bhi load karo
  loadExpiringMembers();

  const { data, error } = await supabaseClient
    .from('payment_submissions')
    .select('id, full_name, whatsapp_number, transaction_reference, amount_pkr, status')
    .eq('status', 'pending')
    .order('id', { ascending: false });

  if (error) {
    showMessage('Error: ' + error.message);
    return;
  }

  if (!data || data.length === 0) {
    showMessage('No pending payment requests.');
    return;
  }

  showMessage(data.length + ' pending request(s) found.');

  data.forEach((payment) => {
    const card = document.createElement('div');
    card.className = 'request';

    function addDetail(label, value) {
      const line = document.createElement('p');
      line.textContent = label + ': ' + (value ?? '');
      card.appendChild(line);
    }

    addDetail('Request ID', payment.id);
    addDetail('Name', payment.full_name);
    addDetail('WhatsApp', payment.whatsapp_number);
    addDetail('JazzCash Reference', payment.transaction_reference);
    addDetail('Amount', 'Rs. ' + payment.amount_pkr);
    addDetail('Status', payment.status);

    const approveButton = document.createElement('button');
    approveButton.textContent = 'Approve Payment';

    approveButton.addEventListener('click', async () => {
      const confirmed = window.confirm(
        'JazzCash payment verify kar li hai? Kya is request ko approve karna hai?'
      );

      if (!confirmed) return;

      approveButton.disabled = true;
      approveButton.textContent = 'Approving...';

      try {
        const { data, error } = await supabaseClient.rpc(
          'approve_membership',
          { p_payment_id: payment.id }
        );

        if (error) throw error;

        showMessage(data || 'Membership approved.');
        await loadRequests();

      } catch (error) {
        showMessage('Approval error: ' + error.message);
        approveButton.disabled = false;
        approveButton.textContent = 'Approve Payment';
      }
    });

    card.appendChild(approveButton);
    requests.appendChild(card);
  });
}

loginButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Enter admin email and password.');
    return;
  }

  loginButton.disabled = true;
  showMessage('Logging in...');

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const isAdmin = await checkAdmin();

    if (isAdmin) {
      showMessage('Admin login successful.');
      await loadRequests();
    }

  } catch (error) {
    showMessage('Login error: ' + error.message);
  } finally {
    loginButton.disabled = false;
  }
});

refreshButton.addEventListener('click', loadRequests);

logoutButton.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
  requests.replaceChildren();
  showMessage('Logged out.');
});

// Check an existing admin session when the page opens
(async function startAdminPage() {
  try {
    const isAdmin = await checkAdmin();

    if (isAdmin) {
      await loadRequests();
    }
  } catch (error) {
    showMessage(error.message);
  }
})();

console.log('Modify Club Admin: Ready!');