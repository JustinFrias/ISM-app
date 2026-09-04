export const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Z3JhdGVmdWwtdmVydmV0LTY5NjEuY2xlcmsuYWNjb3VudHMuZGV2JA';

export const isClerkConfigured = Boolean(
  clerkPublishableKey &&
  clerkPublishableKey.startsWith('pk_') &&
  !clerkPublishableKey.includes('your_clerk') &&
  !clerkPublishableKey.includes('placeholder')
);

/**
 * Resolves a user's role from Clerk public metadata or email rules
 */
export function resolveUserRole(clerkUser: any): 'ADMIN' | 'STAFF' {
  if (!clerkUser) return 'STAFF';

  // 1. Check custom public metadata on Clerk User
  const metaRole = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role;
  if (metaRole === 'ADMIN' || metaRole === 'admin') return 'ADMIN';
  if (metaRole === 'STAFF' || metaRole === 'staff') return 'STAFF';

  const primaryEmail = (clerkUser.primaryEmailAddress?.emailAddress || '').toLowerCase().trim();

  // 2. Direct assignment for known admin accounts
  if (
    primaryEmail === 'alveromaryrose025@gmail.com' ||
    primaryEmail.includes('admin') ||
    primaryEmail === 'admin@skeuo.vault' ||
    primaryEmail === 'elena@skeuo.vault'
  ) {
    return 'ADMIN';
  }

  // 3. Check role assignment mapping in localStorage
  try {
    const roleMappingRaw = localStorage.getItem('skeuo_user_assigned_roles');
    if (roleMappingRaw) {
      const mapping = JSON.parse(roleMappingRaw);
      if (mapping && mapping[primaryEmail]) {
        return mapping[primaryEmail];
      }
    }

    const adminUsersRaw = localStorage.getItem('skeuo_users_management_ADMIN');
    if (adminUsersRaw) {
      const adminUsers = JSON.parse(adminUsersRaw);
      if (Array.isArray(adminUsers) && adminUsers.some((u: any) => u.email?.toLowerCase().trim() === primaryEmail)) {
        return 'ADMIN';
      }
    }

    const staffUsersRaw = localStorage.getItem('skeuo_users_management_STAFF');
    if (staffUsersRaw) {
      const staffUsers = JSON.parse(staffUsersRaw);
      if (Array.isArray(staffUsers) && staffUsers.some((u: any) => u.email?.toLowerCase().trim() === primaryEmail)) {
        return 'STAFF';
      }
    }
  } catch (e) {
    // ignore
  }

  return 'STAFF';
}

/**
 * Custom dark skeuomorphic styling tokens for Clerk components (<SignIn />, <SignUp />, <UserButton />)
 */
export const skeuoClerkAppearance = {
  variables: {
    colorPrimary: '#d4af37',
    colorBackground: '#161920',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorInputBackground: '#0f1117',
    colorInputText: '#f8fafc',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: {
      backgroundColor: '#161920',
      border: '1px solid rgba(212, 175, 55, 0.25)',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    },
    headerTitle: {
      color: '#f8fafc',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    headerSubtitle: {
      color: '#94a3b8',
    },
    socialButtonsBlockButton: {
      backgroundColor: '#1f242f',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#f8fafc',
      '&:hover': {
        backgroundColor: '#272d3b',
        borderColor: 'rgba(212, 175, 55, 0.4)',
      },
    },
    'socialButtonsBlockButton[data-provider="facebook"]': {
      display: 'none !important',
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #f5d77f 0%, #d4af37 50%, #997b1e 100%)',
      color: '#000000',
      fontWeight: 700,
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
      '&:hover': {
        filter: 'brightness(1.1)',
      },
    },
    formFieldInput: {
      backgroundColor: '#0f1117',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#f8fafc',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
      '&:focus': {
        borderColor: '#d4af37',
      },
    },
    footerActionLink: {
      color: '#d4af37',
      fontWeight: 600,
      '&:hover': {
        color: '#f5d77f',
      },
    },
  },
};
