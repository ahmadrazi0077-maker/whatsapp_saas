const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
async function request(endpoint: string, options: any = {}): Promise<any> {
