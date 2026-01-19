
import { User, PromoCode, GameResult, PrizeConfig, INITIAL_PRIZES } from '../types';
import { supabase } from './supabaseClient';

// --- HELPERS ---
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const getChecksum = (base: string): string => {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
     sum = (sum * 37 + base.charCodeAt(i)) % 1296; 
  }
  const c1 = CHARS[Math.floor(sum / 36)];
  const c2 = CHARS[sum % 36];
  return c1 + c2;
};

// We keep the class name "MockBackendService" to make the transition easier 
// without refactoring all import statements in the app, 
// but internally it now calls Supabase.
class BackendService {
  
  // --- Prize Management ---

  async getPrizes(): Promise<PrizeConfig[]> {
    const { data, error } = await supabase.from('prizes').select('*');
    if (error) {
        console.error('Error fetching prizes:', error);
        return INITIAL_PRIZES; // Fallback
    }
    
    // Map snake_case DB fields to camelCase TS interface
    return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        threshold: p.threshold,
        isValuable: p.is_valuable,
        isOutOfStock: p.is_out_of_stock
    }));
  }

  // Synchronous wrapper for compatibility with legacy components that expect sync prize load
  // NOTE: In a real app, components should wait for async. For now, we rely on the fact 
  // that App.tsx calls this early or we handle empty states.
  getPrizesSync(): PrizeConfig[] {
    // This is a hack for the migration. Ideally, refactor components to async.
    // For now, return INITIAL_PRIZES immediately while async loads elsewhere, 
    // or assume components handle loading.
    return INITIAL_PRIZES; 
  }

  // Method to actually fetch prizes for state
  async fetchPrizesAndReturn(): Promise<PrizeConfig[]> {
      return await this.getPrizes();
  }

  async savePrizes(prizes: PrizeConfig[]): Promise<void> {
      // Convert to snake_case for DB
      const dbPrizes = prizes.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          icon: p.icon,
          threshold: p.threshold,
          is_valuable: p.isValuable,
          is_out_of_stock: p.isOutOfStock
      }));

      const { error } = await supabase.from('prizes').upsert(dbPrizes);
      if (error) throw new Error(error.message);
  }

  async updatePrize(updatedPrize: PrizeConfig): Promise<void> {
      // Map to snake_case
      const payload = {
          title: updatedPrize.title,
          description: updatedPrize.description,
          icon: updatedPrize.icon,
          threshold: updatedPrize.threshold,
          is_valuable: updatedPrize.isValuable,
          is_out_of_stock: updatedPrize.isOutOfStock
      };

      const { error } = await supabase.from('prizes').update(payload).eq('id', updatedPrize.id);
      if (error) throw new Error(error.message);
  }

  async addPrize(newPrize: PrizeConfig): Promise<void> {
      // Map to snake_case
      const payload = {
          id: newPrize.id,
          title: newPrize.title,
          description: newPrize.description,
          icon: newPrize.icon,
          threshold: newPrize.threshold,
          is_valuable: newPrize.isValuable,
          is_out_of_stock: newPrize.isOutOfStock
      };

      const { error } = await supabase.from('prizes').insert(payload);
      if (error) throw new Error(error.message);
  }

  async deletePrize(id: string): Promise<void> {
      const { error } = await supabase.from('prizes').delete().eq('id', id);
      if (error) throw new Error(error.message);
  }

  // --- Auth & User ---

  async loginUser(phone: string, password?: string): Promise<User> {
    // Admin Backdoor (Hardcoded for safety/simplicity as per request)
    if (phone === '0000' && password && password.length > 3) { // Simple check
        // We simulate an admin user return
        return {
            id: 'admin-id',
            name: 'admin',
            city: 'System',
            phone: '0000',
            password: 'admin',
            registeredAt: new Date().toISOString(),
            claimedPrizes: [],
            deliveryRequested: false
        };
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

    if (error || !data) {
      throw new Error("Пользователь с таким номером не найден.");
    }

    // In a real app, use Supabase Auth or hash comparison!
    if (data.password !== password) {
       throw new Error("Неверный пароль.");
    }

    // Adapt database fields (snake_case) to TypeScript interface (camelCase)
    const user: User = {
        id: data.id,
        name: data.name,
        city: data.city,
        phone: data.phone,
        password: data.password,
        registeredAt: data.registered_at,
        claimedPrizes: data.claimed_prizes || [],
        deliveryRequested: data.delivery_requested
    };

    localStorage.setItem('belinda_current_user_id', user.id);
    return user;
  }

  async registerUser(name: string, city: string, phone: string, password?: string): Promise<User> {
    // Check existance
    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).single();
    if (existing) {
      throw new Error("Этот номер уже зарегистрирован. Пожалуйста, войдите.");
    }

    const newUserPayload = {
      name,
      city,
      phone,
      password, // Plain text for migration compatibility
      claimed_prizes: [],
      delivery_requested: false,
      trial_count: 0
    };

    const { data, error } = await supabase
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();

    if (error) throw new Error(error.message);

    const user: User = {
        id: data.id,
        name: data.name,
        city: data.city,
        phone: data.phone,
        password: data.password,
        registeredAt: data.registered_at,
        claimedPrizes: data.claimed_prizes || [],
        deliveryRequested: data.delivery_requested
    };

    localStorage.setItem('belinda_current_user_id', user.id);
    return user;
  }

  getCurrentUser(): User | null {
      // NOTE: This is synchronous in the UI, but Supabase is async.
      // We rely on the App.tsx to manage state, but for the initial load
      // we might need to handle this carefully.
      // For now, we return null and let the components fetch via refreshUser
      // OR we strictly use the ID from local storage to Fetch.
      return null; // Components should use async `refreshUser` or state.
  }

  // Helper to get ID from local storage to fetch real user
  getCurrentUserId(): string | null {
      return localStorage.getItem('belinda_current_user_id');
  }

  async refreshUser(): Promise<User | null> {
    const id = this.getCurrentUserId();
    if (!id) return null;
    if (id === 'admin-id') {
         return {
            id: 'admin-id',
            name: 'admin',
            city: 'System',
            phone: '0000',
            password: 'admin',
            registeredAt: new Date().toISOString(),
            claimedPrizes: [],
            deliveryRequested: false
        };
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) {
        this.logout();
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        city: data.city,
        phone: data.phone,
        password: data.password,
        registeredAt: data.registered_at,
        claimedPrizes: data.claimed_prizes || [],
        deliveryRequested: data.delivery_requested
    };
  }

  logout() {
    localStorage.removeItem('belinda_current_user_id');
  }

  // --- Trials & Codes ---

  getTrialCount(userId: string): number {
    // This was sync. We need to handle this async in the UI now, 
    // or cache it in the user object.
    // For compatibility, we will assume the caller has the updated user object
    // but the original code called backend.getTrialCount.
    // We will return 0 and rely on `refreshUser` to populate UI state if needed,
    // BUT we need to change how this is called or make it async.
    // To minimize refactor: We will use a temporary sync hack via localStorage 
    // that we update whenever we fetch the user.
    return parseInt(localStorage.getItem(`trial_count_${userId}`) || '0');
  }

  // Helper to sync trial count to local storage for the sync getter
  async syncTrialCount(userId: string) {
      if(userId === 'admin-id') return;
      const { data } = await supabase.from('users').select('trial_count').eq('id', userId).single();
      if (data) {
          localStorage.setItem(`trial_count_${userId}`, data.trial_count.toString());
      }
  }

  async useTrial(userId: string): Promise<number> {
    // 1. Get current
    const { data } = await supabase.from('users').select('trial_count').eq('id', userId).single();
    const current = data ? data.trial_count : 0;
    const newCount = current + 1;
    
    // 2. Update
    await supabase.from('users').update({ trial_count: newCount }).eq('id', userId);
    localStorage.setItem(`trial_count_${userId}`, newCount.toString());
    return newCount;
  }

  async validateAndUseCode(codeStrRaw: string, userId: string): Promise<boolean> {
    const codeStr = codeStrRaw.trim().toUpperCase();
    
    if (userId === 'admin-id') return true;

    // Check if code exists
    const { data: codeData, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', codeStr)
        .single();

    if (!codeData) {
        // Check if valid checksum but not in DB (dynamically generate on fly logic from mock?)
        // The mock logic allowed generating valid checksums on the fly. 
        // For security in a real app, codes should pre-exist.
        // However, if we want to support the checksum logic:
        if (codeStr.length === 6) {
             const base = codeStr.substring(0, 4);
             const checksum = codeStr.substring(4, 6);
             if (getChecksum(base) === checksum) {
                 // It's a valid format, insert it as new
                 const { error: insertError } = await supabase.from('promo_codes').insert({
                     code: codeStr,
                     is_used: true, // immediately use
                     is_issued: true,
                     assigned_to: userId
                 });
                 if (insertError) throw new Error("Ошибка обработки кода");
                 return true;
             }
        }
        throw new Error('Код не найден');
    }

    if (codeData.is_used) throw new Error('Код уже использован');
    
    // Mark as used
    const { error: updateError } = await supabase
        .from('promo_codes')
        .update({ is_used: true, assigned_to: userId })
        .eq('code', codeStr);

    if (updateError) throw new Error(updateError.message);

    return true;
  }

  async generateCodes(quantity: number): Promise<PromoCode[]> {
    const newCodes = [];
    for (let i = 0; i < quantity; i++) {
      let base = '';
      for(let j=0; j<4; j++) {
          base += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      const checksum = getChecksum(base);
      const codeStr = base + checksum;

      newCodes.push({ 
        code: codeStr, 
        is_used: false, 
        is_issued: false,
        generated_at: new Date().toISOString() 
      });
    }

    const { error } = await supabase.from('promo_codes').insert(newCodes);
    if (error) throw new Error(error.message);

    // Fetch back to match interface
    return newCodes.map(c => ({
        code: c.code,
        isUsed: false,
        isIssued: false,
        generatedAt: c.generated_at
    }));
  }
  
  async markCodesAsIssued(codeStrings: string[]): Promise<void> {
      await supabase
        .from('promo_codes')
        .update({ is_issued: true })
        .in('code', codeStrings);
  }

  async saveGameResult(userId: string, score: number, usedCode: string, isTrial: boolean = false): Promise<GameResult> {
    // 1. Determine Prize
    const prizes = await this.getPrizes();
    prizes.sort((a, b) => b.threshold - a.threshold);

    let potentialPrize = null;
    if (!isTrial) {
        const achieved = prizes.find(p => score >= p.threshold);
        if (achieved) potentialPrize = achieved.title;
    }

    const resultPayload = {
      user_id: userId,
      score,
      prize: potentialPrize, 
      code_used: isTrial ? 'TRIAL' : usedCode,
      played_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('game_results').insert(resultPayload).select().single();
    if (error) throw new Error(error.message);

    return {
        id: data.id,
        userId: data.user_id,
        score: data.score,
        prize: data.prize,
        codeUsed: data.code_used,
        playedAt: data.played_at
    };
  }

  async claimPrize(userId: string, prizeTitle: string): Promise<User> {
    // Fetch User
    const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!userData) throw new Error("User not found");
    
    let currentClaims: string[] = userData.claimed_prizes || [];

    // Validation Logic
    const prizes = await this.getPrizes();
    const prizeConfig = prizes.find(p => p.title === prizeTitle);
    
    if (!prizeConfig) throw new Error("Prize not found");
    if (prizeConfig.isOutOfStock) throw new Error("Этот приз закончился");

    if (currentClaims.length >= 2) {
      throw new Error("Вы уже выбрали максимальное количество призов (2).");
    }

    const isNewValuable = prizeConfig.isValuable;
    const hasValuable = currentClaims.some(claimedTitle => {
        const p = prizes.find(cfg => cfg.title === claimedTitle);
        return p && p.isValuable;
    });

    if (isNewValuable && hasValuable) {
      throw new Error("Можно выбрать только один ценный приз.");
    }

    // Add Prize
    currentClaims.push(prizeTitle);

    const { data: updated, error } = await supabase
        .from('users')
        .update({ claimed_prizes: currentClaims })
        .eq('id', userId)
        .select()
        .single();
    
    if (error) throw new Error(error.message);

    return {
        id: updated.id,
        name: updated.name,
        city: updated.city,
        phone: updated.phone,
        password: updated.password,
        registeredAt: updated.registered_at,
        claimedPrizes: updated.claimed_prizes,
        deliveryRequested: updated.delivery_requested
    };
  }

  async requestDelivery(userId: string): Promise<User> {
    const { data: updated, error } = await supabase
        .from('users')
        .update({ delivery_requested: true })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: updated.id,
        name: updated.name,
        city: updated.city,
        phone: updated.phone,
        password: updated.password,
        registeredAt: updated.registered_at,
        claimedPrizes: updated.claimed_prizes || [],
        deliveryRequested: updated.delivery_requested
    };
  }

  async getUserResults(userId: string): Promise<GameResult[]> {
    if (userId === 'admin-id') return [];

    const { data } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false });

    if (!data) return [];

    return data.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        score: r.score,
        prize: r.prize,
        codeUsed: r.code_used,
        playedAt: r.played_at
    }));
  }

  async getAdminStats() {
    // Parallel fetching
    const [usersRes, codesRes, resultsRes, prizesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('promo_codes').select('*'),
        supabase.from('game_results').select('*'),
        supabase.from('prizes').select('*')
    ]);

    const users = usersRes.data || [];
    const codes = codesRes.data || [];
    const results = resultsRes.data || [];
    const prizes = prizesRes.data || [];

    const claimedCounts: Record<string, number> = {};
    prizes.forEach((p: any) => claimedCounts[p.title] = 0);

    users.forEach((u: any) => {
       if (u.claimed_prizes) {
         u.claimed_prizes.forEach((p: string) => {
             if (claimedCounts[p] !== undefined) claimedCounts[p]++;
             else claimedCounts[p] = 1;
         });
       }
    });

    const mappedUsers: User[] = users.map((u: any) => ({
        id: u.id,
        name: u.name,
        city: u.city,
        phone: u.phone,
        password: u.password,
        registeredAt: u.registered_at,
        claimedPrizes: u.claimed_prizes || [],
        deliveryRequested: u.delivery_requested
    }));

    const mappedCodes: PromoCode[] = codes.map((c: any) => ({
        code: c.code,
        isUsed: c.is_used,
        isIssued: c.is_issued,
        assignedTo: c.assigned_to,
        generatedAt: c.generated_at
    }));

    const mappedPrizes: PrizeConfig[] = prizes.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        threshold: p.threshold,
        isValuable: p.is_valuable,
        isOutOfStock: p.is_out_of_stock
    }));

    return {
      totalUsers: users.length,
      totalCodes: codes.length,
      usedCodes: codes.filter((c: any) => c.is_used).length,
      deliveryRequests: users.filter((u: any) => u.delivery_requested).length,
      totalGames: results.length,
      prizesAwarded: claimedCounts,
      allCodes: mappedCodes,
      users: mappedUsers,
      prizesConfig: mappedPrizes
    };
  }
}

// Rename export to match existing imports
export const backend = new BackendService();
