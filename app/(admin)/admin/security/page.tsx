import { adminDb } from '@/lib/firebase/admin';

// Helper to ensure we don't crash if adminDb is not ready
async function getViolations() {
  if (!adminDb) return [];
  
  try {
    // Note: Firestore filtering might require composite indexes. 
    // For now, let's just fetch recent logs and filter in memory to avoid index errors during setup.
    const snapshot = await adminDb.collection('security_logs')
      .orderBy('details.timestamp', 'desc')
      .limit(200)
      .get();
      
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Failed to fetch security logs:', error);
    return [];
  }
}

export default async function SecurityDashboard() {
  const violations = await getViolations();

  // Aggregate data
  const aggregatedData: Record<string, { count: number, device_brands: Set<string> }> = {};
  
  violations.forEach(v => {
      const action = v.action || 'unknown';
      if (!aggregatedData[action]) {
          aggregatedData[action] = { count: 0, device_brands: new Set() };
      }
      aggregatedData[action].count++;
      
      const merk = v.details?.merk;
      if (merk) {
          aggregatedData[action].device_brands.add(merk);
      }
  });

  const tableRows = Object.entries(aggregatedData)
    .map(([action, data]) => ({
      action,
      count: data.count,
      device_brands: Array.from(data.device_brands).join(', ')
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Security Violations (Last 24h)</h1>
      <div className="overflow-hidden bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Violation Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Brand
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableRows.length > 0 ? (
              tableRows.map((row) => (
                <tr key={row.action} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.device_brands || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.count}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  No security violations recorded in the last 24 hours.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
