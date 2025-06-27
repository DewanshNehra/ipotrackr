import { fetchIPOData } from '@/lib/api';
import IPOSectionClient from './ipoSectionClient';

export default async function IPOSection() {
    const data = await fetchIPOData();
    
    return <IPOSectionClient initialData={data} />;
}