import { useState, useEffect } from 'react';
import {
  SquaresFour, Users, Wrench, CalendarBlank, CurrencyCircleDollar, Scales,
  ShieldCheck, ClipboardText, Star, Trash, XCircle, ArrowsCounterClockwise,
  ShieldSlash, CheckCircle, SealCheck,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import {
  Card, StatusBadge, StatCard, TabBar, tabId, tabPanelId, Pagination, EmptyState,
  Alert, ConfirmDialog, Skeleton, Field, Spinner, STATUS_TOKENS,
} from '../components/ui';

// Compact table action button — keeps admin tables dense but on-token
const ActionBtn = ({ tone = 'neutral', loading, className = '', children, ...rest }) => {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    solid: 'bg-trust-600 text-white hover:bg-trust-700 shadow-cta',
  };
  return (
    <button
      type="button"
      disabled={loading}
      className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="xs" /> : children}
    </button>
  );
};

// Shared table shell: scroll wrapper + tokenized header/dividers
const TableShell = ({ headers, caption, children, footer }) => (
  <Card padding="p-0" className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        {caption && <caption className="sr-only-x">{caption}</caption>}
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="px-6 py-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
    {footer}
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [providersPage, setProvidersPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [disputesPage, setDisputesPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [providersTotalPages, setProvidersTotalPages] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
  const [disputesTotalPages, setDisputesTotalPages] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  // Filters
  const [usersSearch, setUsersSearch] = useState('');
  const [providersSearch, setProvidersSearch] = useState('');
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');

  // Destructive-action confirmation: { type, id, action, extra, title, message, confirmLabel }
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ search: usersSearch, page: usersPage, limit: 10 });
      setUsers(res.data.users || []);
      setUsersTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
      throw err;
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await adminAPI.getProviders({ search: providersSearch, page: providersPage, limit: 10 });
      setProviders(res.data.providers || []);
      setProvidersTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load providers:', err);
      throw err;
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await adminAPI.getBookings({ status: bookingStatusFilter, search: bookingsSearch, page: bookingsPage, limit: 10 });
      setBookings(res.data.bookings || []);
      setBookingsTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      throw err;
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await adminAPI.getPayments({ status: paymentStatusFilter, page: paymentsPage, limit: 10 });
      setPayments(res.data.payments || []);
      setPaymentsTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load payments:', err);
      throw err;
    }
  };

  const fetchDisputes = async () => {
    try {
      const res = await adminAPI.getDisputes({ status: disputeStatusFilter, page: disputesPage, limit: 10 });
      setDisputes(res.data.disputes || []);
      setDisputesTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load disputes:', err);
      throw err;
    }
  };

  const fetchVerifications = async () => {
    try {
      const res = await adminAPI.getVerifications();
      setVerifications(res.data.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
      throw err;
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await adminAPI.getAuditLogs({ action: auditActionFilter, page: auditPage, limit: 20 });
      setAuditLogs(res.data.logs || []);
      setAuditTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVerifications();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, usersPage, usersSearch]);

  useEffect(() => {
    if (activeTab === 'providers') fetchProviders();
  }, [activeTab, providersPage, providersSearch]);

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab, bookingsPage, bookingsSearch, bookingStatusFilter]);

  useEffect(() => {
    if (activeTab === 'payments') fetchPayments();
  }, [activeTab, paymentsPage, paymentStatusFilter]);

  useEffect(() => {
    if (activeTab === 'disputes') fetchDisputes();
  }, [activeTab, disputesPage, disputeStatusFilter]);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, auditPage, auditActionFilter]);

  const handleAction = async (type, id, action, extra = {}) => {
    setActionLoading((prev) => ({ ...prev, [`${type}-${id}-${action}`]: true }));
    try {
      if (type === 'user') {
        if (action === 'activate') await adminAPI.updateUser(id, { isActive: true });
        else if (action === 'deactivate') await adminAPI.updateUser(id, { isActive: false });
        else if (action === 'makeAdmin') await adminAPI.updateUser(id, { role: 'ADMIN' });
        else if (action === 'makeProvider') await adminAPI.updateUser(id, { role: 'PROVIDER' });
        else if (action === 'makeCustomer') await adminAPI.updateUser(id, { role: 'CUSTOMER' });
        else if (action === 'delete') await adminAPI.deleteUser(id);
      } else if (type === 'provider') {
        if (action === 'verify') await adminAPI.updateProvider(id, { identityVerified: true, skillsVerified: true, locationVerified: true });
        else if (action === 'unverify') await adminAPI.updateProvider(id, { identityVerified: false, skillsVerified: false, locationVerified: false });
      } else if (type === 'booking') {
        if (action === 'cancel') await adminAPI.adminCancelBooking(id, extra.reason);
      } else if (type === 'payment') {
        if (action === 'refund') await adminAPI.refundPayment(id, extra.reason);
      } else if (type === 'verification') {
        await adminAPI.updateVerificationStatus(id, { status: action, adminNotes: `Status updated to ${action} by Admin` });
      }

      const refreshPromises = [];
      if (activeTab === 'users') refreshPromises.push(fetchUsers());
      if (activeTab === 'providers') refreshPromises.push(fetchProviders());
      if (activeTab === 'bookings') refreshPromises.push(fetchBookings());
      if (activeTab === 'payments') refreshPromises.push(fetchPayments());
      if (activeTab === 'disputes') refreshPromises.push(fetchDisputes());
      if (activeTab === 'verifications') refreshPromises.push(fetchVerifications());
      if (activeTab === 'audit') refreshPromises.push(fetchAuditLogs());
      refreshPromises.push(fetchStats());

      await Promise.all(refreshPromises);
      setError('');
    } catch (err) {
      console.error('Admin action failed:', err);
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${type}-${id}-${action}`]: false }));
      setConfirmTarget(null);
    }
  };

  /** Route destructive actions through a confirmation dialog. */
  const requestAction = (type, id, action, extra = {}, confirm) => {
    if (confirm) {
      setConfirmTarget({ type, id, action, extra, ...confirm });
      return;
    }
    handleAction(type, id, action, extra);
  };

  const pendingVerifications = verifications.filter((v) => v.status === 'PENDING').length;
  const openDisputes = stats?.openDisputes || 0;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: SquaresFour },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'providers', label: 'Providers', icon: Wrench },
    { id: 'bookings', label: 'Bookings', icon: CalendarBlank },
    { id: 'payments', label: 'Payments', icon: CurrencyCircleDollar },
    { id: 'disputes', label: 'Disputes', icon: Scales, count: openDisputes },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck, count: pendingVerifications },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardText },
  ];

  const bookingStatusOptions = ['REQUESTED', 'ACCEPTED', 'PRICE_AGREED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED'];
  const disputeStatusOptions = ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard icon={Users} tone="navy" label="Total Users" value={stats?.totalUsers || 0} sublabel={`${stats?.totalProviders || 0} Providers, ${stats?.totalCustomers || 0} Customers`} />
        <StatCard icon={CalendarBlank} tone="blue" label="Total Bookings" value={stats?.totalBookings || 0} sublabel="All time" />
        <StatCard icon={CurrencyCircleDollar} tone="emerald" label="Revenue" value={`GH₵ ${stats?.totalRevenue?.toFixed(2) || '0.00'}`} sublabel="Completed payments" />
        <StatCard icon={Scales} tone="amber" label="Open Issues" value={openDisputes} sublabel={`${stats?.pendingVerifications || 0} Pending verifications`} />
      </div>

      <TableShell
        headers={['ID', 'Customer', 'Provider', 'Service', 'Status', 'Date']}
        caption="Recent bookings"
      >
        {stats?.recentBookings?.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-6 py-4">
              <EmptyState size="sm" className="!border-0 !bg-transparent" icon={CalendarBlank} title="No bookings yet" />
            </td>
          </tr>
        ) : (
          stats?.recentBookings?.map((b) => (
            <tr key={b.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-bold tabular-nums text-navy-900">#{b.id}</td>
              <td className="px-6 py-4">{b.customer?.firstName} {b.customer?.lastName}</td>
              <td className="px-6 py-4">{b.provider?.user?.firstName} {b.provider?.user?.lastName}</td>
              <td className="px-6 py-4">{b.service?.name}</td>
              <td className="px-6 py-4"><StatusBadge status={b.status} domain="booking" /></td>
              <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">{new Date(b.createdAt).toLocaleDateString()}</td>
            </tr>
          ))
        )}
      </TableShell>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <Field
        aria-label="Search users"
        type="text"
        placeholder="Search users..."
        value={usersSearch}
        onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
        size="sm"
        className="max-w-sm"
      />
      <TableShell headers={['Name', 'Email', 'Role', 'Status', 'Provider', 'Actions']} caption="Platform users">
        {users.length === 0 ? (
          <tr><td colSpan="6" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={Users} title="No users found" body={usersSearch ? `No users match "${usersSearch}".` : 'Users will appear here as they register.'} /></td></tr>
        ) : (
          users.map((u) => (
            <tr key={u.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-semibold text-navy-900">{u.firstName} {u.lastName}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{u.email}</td>
              <td className="px-6 py-4"><StatusBadge status={u.role} domain="role" /></td>
              <td className="px-6 py-4">
                <StatusBadge status={u.isActive ? 'COMPLETED' : 'CANCELLED'} domain="payment" />
                <span className="sr-only-x">{u.isActive ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {u.provider ? `${u.provider.businessName || 'Provider'} (${u.provider.identityVerified ? 'Verified' : 'Unverified'})` : '—'}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <ActionBtn
                    tone="neutral"
                    onClick={() => requestAction('user', u.id, u.isActive ? 'deactivate' : 'activate')}
                    loading={actionLoading[`user-${u.id}-${u.isActive ? 'deactivate' : 'activate'}`]}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </ActionBtn>
                  {u.role !== 'ADMIN' && (
                    <>
                      <ActionBtn
                        tone="indigo"
                        onClick={() => requestAction('user', u.id, 'makeAdmin')}
                        loading={actionLoading[`user-${u.id}-makeAdmin`]}
                      >
                        Make Admin
                      </ActionBtn>
                      <ActionBtn
                        tone="danger"
                        onClick={() =>
                          requestAction('user', u.id, 'delete', {}, {
                            title: 'Delete this user?',
                            message: `This permanently deletes ${u.firstName} ${u.lastName} (${u.email}) and cannot be undone.`,
                            confirmLabel: 'Delete User',
                          })
                        }
                        loading={actionLoading[`user-${u.id}-delete`]}
                      >
                        <Trash aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Delete
                      </ActionBtn>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-4">
      <Field
        aria-label="Search providers"
        type="text"
        placeholder="Search providers..."
        value={providersSearch}
        onChange={(e) => { setProvidersSearch(e.target.value); setProvidersPage(1); }}
        size="sm"
        className="max-w-sm"
      />
      <TableShell headers={['Provider', 'Business', 'Trust Score', 'Verifications', 'Actions']} caption="Service providers">
        {providers.length === 0 ? (
          <tr><td colSpan="5" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={Wrench} title="No providers found" body={providersSearch ? `No providers match "${providersSearch}".` : 'Providers will appear here as they register.'} /></td></tr>
        ) : (
          providers.map((p) => (
            <tr key={p.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="font-semibold text-navy-900">{p.user?.firstName} {p.user?.lastName}</div>
                <div className="text-xs text-slate-500">{p.user?.email}</div>
              </td>
              <td className="px-6 py-4">{p.businessName || '—'}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-navy-900">
                  <Star aria-hidden="true" weight="fill" size={13} className="text-gold-400" />
                  {p.trustScore || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {p.identityVerified && <span className="inline-flex items-center gap-0.5 text-trust-700"><SealCheck aria-hidden="true" weight="fill" size={12} /> ID</span>}
                  {p.skillsVerified && <span className="inline-flex items-center gap-0.5 text-trust-700"><SealCheck aria-hidden="true" weight="fill" size={12} /> Skills</span>}
                  {p.locationVerified && <span className="inline-flex items-center gap-0.5 text-trust-700"><SealCheck aria-hidden="true" weight="fill" size={12} /> Loc</span>}
                  {!p.identityVerified && !p.skillsVerified && !p.locationVerified && <span className="text-slate-400">None</span>}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <ActionBtn
                    tone="emerald"
                    onClick={() => requestAction('provider', p.id, 'verify')}
                    loading={actionLoading[`provider-${p.id}-verify`]}
                  >
                    <ShieldCheck aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Verify All
                  </ActionBtn>
                  <ActionBtn
                    tone="danger"
                    onClick={() =>
                      requestAction('provider', p.id, 'unverify', {}, {
                        title: 'Unverify this provider?',
                        message: `${p.user?.firstName} ${p.user?.lastName} will lose all verification badges until re-approved.`,
                        confirmLabel: 'Unverify',
                      })
                    }
                    loading={actionLoading[`provider-${p.id}-unverify`]}
                  >
                    <ShieldSlash aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Unverify
                  </ActionBtn>
                </div>
              </td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={providersPage} totalPages={providersTotalPages} onPageChange={setProvidersPage} />
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Field
          aria-label="Search bookings"
          type="text"
          placeholder="Search bookings..."
          value={bookingsSearch}
          onChange={(e) => { setBookingsSearch(e.target.value); setBookingsPage(1); }}
          size="sm"
          className="max-w-sm flex-1"
        />
        <div className="w-48">
          <Field
            aria-label="Filter bookings by status"
            as="select"
            value={bookingStatusFilter}
            onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingsPage(1); }}
            size="sm"
          >
            <option value="">All Statuses</option>
            {bookingStatusOptions.map((s) => (
              <option key={s} value={s}>{STATUS_TOKENS.booking[s]?.label || s}</option>
            ))}
          </Field>
        </div>
      </div>
      <TableShell headers={['ID', 'Customer', 'Provider', 'Service', 'Status', 'Price', 'Actions']} caption="Platform bookings">
        {bookings.length === 0 ? (
          <tr><td colSpan="7" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={CalendarBlank} title="No bookings found" body="Try changing the search or status filter." /></td></tr>
        ) : (
          bookings.map((b) => (
            <tr key={b.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-bold tabular-nums text-navy-900">#{b.id}</td>
              <td className="px-6 py-4">{b.customer?.firstName} {b.customer?.lastName}</td>
              <td className="px-6 py-4">{b.provider?.user?.firstName} {b.provider?.user?.lastName}</td>
              <td className="px-6 py-4">{b.service?.name}</td>
              <td className="px-6 py-4"><StatusBadge status={b.status} domain="booking" /></td>
              <td className="px-6 py-4 font-semibold tabular-nums">{b.price ? `GH₵ ${b.price.toFixed(2)}` : '—'}</td>
              <td className="px-6 py-4">
                {!['CANCELLED', 'COMPLETED', 'PAID', 'REVIEWED'].includes(b.status) && (
                  <ActionBtn
                    tone="danger"
                    onClick={() =>
                      requestAction('booking', b.id, 'cancel', { reason: 'Cancelled by admin' }, {
                        title: 'Cancel this booking?',
                        message: `Booking #${b.id} (${b.service?.name}) will be cancelled on behalf of the platform.`,
                        confirmLabel: 'Cancel Booking',
                      })
                    }
                    loading={actionLoading[`booking-${b.id}-cancel`]}
                  >
                    Cancel
                  </ActionBtn>
                )}
              </td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={bookingsPage} totalPages={bookingsTotalPages} onPageChange={setBookingsPage} />
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-4">
      <div className="w-48">
        <Field
          aria-label="Filter payments by status"
          as="select"
          value={paymentStatusFilter}
          onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentsPage(1); }}
          size="sm"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_TOKENS.payment).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </Field>
      </div>
      <TableShell headers={['ID', 'Booking', 'Customer', 'Provider', 'Amount', 'Status', 'Actions']} caption="Platform payments">
        {payments.length === 0 ? (
          <tr><td colSpan="7" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={CurrencyCircleDollar} title="No payments found" body="Try changing the status filter." /></td></tr>
        ) : (
          payments.map((p) => (
            <tr key={p.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-bold tabular-nums text-navy-900">#{p.id}</td>
              <td className="px-6 py-4">{p.booking?.service?.name || '—'}</td>
              <td className="px-6 py-4">{p.booking?.customer?.firstName} {p.booking?.customer?.lastName}</td>
              <td className="px-6 py-4">{p.booking?.provider?.user?.firstName} {p.booking?.provider?.user?.lastName}</td>
              <td className="px-6 py-4 font-bold tabular-nums">GH₵ {p.amount.toFixed(2)}</td>
              <td className="px-6 py-4"><StatusBadge status={p.status} domain="payment" /></td>
              <td className="px-6 py-4">
                {p.status === 'COMPLETED' && (
                  <ActionBtn
                    tone="amber"
                    onClick={() =>
                      requestAction('payment', p.id, 'refund', { reason: 'Refunded by admin' }, {
                        title: 'Refund this payment?',
                        message: `GH₵ ${p.amount.toFixed(2)} for booking #${p.bookingId || p.id} will be refunded to the customer.`,
                        confirmLabel: 'Refund Payment',
                      })
                    }
                    loading={actionLoading[`payment-${p.id}-refund`]}
                  >
                    <ArrowsCounterClockwise aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Refund
                  </ActionBtn>
                )}
              </td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={paymentsPage} totalPages={paymentsTotalPages} onPageChange={setPaymentsPage} />
    </div>
  );

  const renderDisputes = () => (
    <div className="space-y-4">
      <div className="w-56">
        <Field
          aria-label="Filter disputes by status"
          as="select"
          value={disputeStatusFilter}
          onChange={(e) => { setDisputeStatusFilter(e.target.value); setDisputesPage(1); }}
          size="sm"
        >
          <option value="">All Statuses</option>
          {disputeStatusOptions.map((s) => (
            <option key={s} value={s}>{STATUS_TOKENS.dispute[s]?.label || s}</option>
          ))}
        </Field>
      </div>
      <TableShell headers={['ID', 'Booking', 'Raised By', 'Type', 'Status', 'Assigned To']} caption="Platform disputes">
        {disputes.length === 0 ? (
          <tr><td colSpan="6" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={Scales} title="No disputes found" body="Try changing the status filter." /></td></tr>
        ) : (
          disputes.map((d) => (
            <tr key={d.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-bold tabular-nums text-navy-900">#{d.id}</td>
              <td className="px-6 py-4">{d.booking?.service?.name || '—'}</td>
              <td className="px-6 py-4">{d.raiser?.firstName} {d.raiser?.lastName}</td>
              <td className="px-6 py-4 text-xs">{d.type?.replace('_', ' ')}</td>
              <td className="px-6 py-4"><StatusBadge status={d.status} domain="dispute" /></td>
              <td className="px-6 py-4">{d.assignedAdmin ? `${d.assignedAdmin.firstName} ${d.assignedAdmin.lastName}` : 'Unassigned'}</td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={disputesPage} totalPages={disputesTotalPages} onPageChange={setDisputesPage} />
    </div>
  );

  const renderVerifications = () => (
    <TableShell headers={['Provider', 'Type', 'Details', 'Status', 'Date', 'Actions']} caption="Verification requests">
      {verifications.length === 0 ? (
        <tr><td colSpan="6" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={ShieldCheck} title="No verification requests" body="Provider submissions will appear here for review." /></td></tr>
      ) : (
        verifications.map((req) => (
          <tr key={req.id} className="transition hover:bg-slate-50">
            <td className="px-6 py-4">
              <div className="font-semibold text-navy-900">{req.provider?.user?.firstName} {req.provider?.user?.lastName}</div>
              <div className="text-xs text-slate-500">{req.provider?.user?.email}</div>
            </td>
            <td className="px-6 py-4">
              <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                {req.type}
              </span>
            </td>
            <td className="max-w-xs px-6 py-4 text-xs text-slate-600">
              <span className="font-bold">Doc:</span> <span className="break-all">{req.documentUrl || 'N/A'}</span>
              <br />
              <span className="font-bold">Note:</span> {req.notes || 'None'}
            </td>
            <td className="px-6 py-4"><StatusBadge status={req.status} domain="verification" /></td>
            <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">{new Date(req.submittedAt).toLocaleDateString()}</td>
            <td className="px-6 py-4">
              {req.status === 'PENDING' && (
                <div className="flex gap-2">
                  <ActionBtn
                    tone="solid"
                    onClick={() => requestAction('verification', req.id, 'VERIFIED')}
                    loading={actionLoading[`verification-${req.id}-VERIFIED`]}
                  >
                    <CheckCircle aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Approve
                  </ActionBtn>
                  <ActionBtn
                    tone="danger"
                    onClick={() => requestAction('verification', req.id, 'REJECTED')}
                    loading={actionLoading[`verification-${req.id}-REJECTED`]}
                  >
                    <XCircle aria-hidden="true" size={12} weight="bold" className="mr-0.5 inline" /> Reject
                  </ActionBtn>
                </div>
              )}
            </td>
          </tr>
        ))
      )}
    </TableShell>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      <Field
        aria-label="Filter audit logs by action"
        type="text"
        placeholder="Filter by action..."
        value={auditActionFilter}
        onChange={(e) => { setAuditActionFilter(e.target.value); setAuditPage(1); }}
        size="sm"
        className="max-w-sm"
      />
      <TableShell headers={['Admin', 'Action', 'Target', 'Details', 'IP', 'Date']} caption="Admin audit logs">
        {auditLogs.length === 0 ? (
          <tr><td colSpan="6" className="px-6 py-4"><EmptyState size="sm" className="!border-0 !bg-transparent" icon={ClipboardText} title="No audit logs found" body="Admin actions are recorded here automatically." /></td></tr>
        ) : (
          auditLogs.map((log) => (
            <tr key={log.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="font-semibold text-navy-900">{log.admin?.firstName} {log.admin?.lastName}</div>
                <div className="text-xs text-slate-500">{log.admin?.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-bold text-navy-800">
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 text-xs tabular-nums">
                {log.targetType} #{log.targetId}
              </td>
              <td className="max-w-xs truncate px-6 py-4 text-xs text-slate-600" title={log.details}>
                {log.details || '—'}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">{log.ipAddress || '—'}</td>
              <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))
        )}
      </TableShell>
      <Pagination page={auditPage} totalPages={auditTotalPages} onPageChange={setAuditPage} />
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Admin Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-8 text-white shadow-lift">
        <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center">
          <div>
            <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
              System Administration
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              GhanaTrust Admin Control Panel
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Logged in as {user?.email} ({user?.firstName} {user?.lastName})
            </p>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ShieldCheck aria-hidden="true" weight="duotone" size={30} className="text-trust-400" />
          </span>
        </div>
      </div>

      {/* Error banner for failed actions/fetches */}
      {error && (
        <Alert tone="error" onClose={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card padding="px-2 pt-2" className="mb-6 overflow-x-auto">
        <TabBar
          groupId="admin"
          ariaLabel="Admin control panel sections"
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {/* Tab Content */}
      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={tabPanelId(tab.id, 'admin')}
          aria-labelledby={tabId(tab.id, 'admin')}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {!loading && activeTab === tab.id && (
            <>
              {tab.id === 'overview' && renderOverview()}
              {tab.id === 'users' && renderUsers()}
              {tab.id === 'providers' && renderProviders()}
              {tab.id === 'bookings' && renderBookings()}
              {tab.id === 'payments' && renderPayments()}
              {tab.id === 'disputes' && renderDisputes()}
              {tab.id === 'verifications' && renderVerifications()}
              {tab.id === 'audit' && renderAuditLogs()}
            </>
          )}
        </div>
      ))}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      )}

      {/* Destructive action confirmation */}
      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => handleAction(confirmTarget.type, confirmTarget.id, confirmTarget.action, confirmTarget.extra)}
        title={confirmTarget?.title}
        message={confirmTarget?.message}
        confirmLabel={confirmTarget?.confirmLabel}
      />
    </div>
  );
};

export default AdminDashboard;
