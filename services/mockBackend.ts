
import { supabase } from './supabaseClient';
import { User, GameResult, PromoCode, PrizeConfig, INITIAL_PRIZES, CodeRequest } from '../types';

// Helper for Image Compression
const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

class MockBackendService {
  private currentUserId: string | null = localStorage.getItem('lambrotin_user_id');
  private _trialCountCache: Record<string, number> = {};

  private mapUserFromDB(u: any): User {
    return {
      id: u.id,
      name: u.name,
      city: u.city,
      phone: u.phone,
      password: u.password,
      registeredAt: u.registered_at,
      claimedPrizes: u.claimed_prizes || [],
      deliveryRequested: u.delivery_requested
    };
  }

  async getPrizes(): Promise<PrizeConfig[]> {
    const { data, error } = await supabase.from('prize_configs').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_PRIZES;
    }
    return data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      icon: p.icon,
      threshold: p.threshold,
      isValuable: p.is_valuable,
      isOutOfStock: p.is_out_of_stock
    }));
  }

  async refreshUser(): Promise<User | null> {
    if (!this.currentUserId) return null;
    const { data, error } = await supabase.from('users').select('*').eq('id', this.currentUserId).single();
    if (error || !data) {
      this.logout();
      return null;
    }
    return this.mapUserFromDB(data);
  }

  async loginUser(phone: string, password: string): Promise<User> {
    const { data, error } = await supabase.from('users').select('*').eq('phone', phone).eq('password', password).single();
    if (error || !data) throw new Error("Неверный телефон или пароль");
    this.currentUserId = data.id;
    localStorage.setItem('lambrotin_user_id', data.id);
    return this.mapUserFromDB(data);
  }

  async registerUser(name: string, city: string, phone: string, password: string): Promise<User> {
    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).single();
    if (existing) throw new Error("Пользователь с таким телефоном уже существует");

    const { data, error } = await supabase.from('users').insert({
      name, city, phone, password,
      registered_at: new Date().toISOString(),
      trial_count: 6,
      claimed_prizes: [],
      delivery_requested: false
    }).select().single();

    if (error) throw new Error(error.message);
    this.currentUserId = data.id;
    localStorage.setItem('lambrotin_user_id', data.id);
    return this.mapUserFromDB(data);
  }

  logout() {
    this.currentUserId = null;
    localStorage.removeItem('lambrotin_user_id');
  }

  async getTrialCountAsync(userId: string): Promise<number> {
      const { data } = await supabase.from('users').select('trial_count').eq('id', userId).single();
      const count = data?.trial_count ?? 6;
      this._trialCountCache[userId] = count;
      return count;
  }
  
  getTrialCount(userId: string): number {
      return this._trialCountCache[userId] ?? 0;
  }

  async syncTrialCount(userId: string) {
      await this.getTrialCountAsync(userId);
  }

  async useTrial(userId: string) {
      const current = this.getTrialCount(userId);
      const newCount = Math.max(0, current - 1);
      await supabase.from('users').update({ trial_count: newCount }).eq('id', userId);
      this._trialCountCache[userId] = newCount;
  }

  async saveGameResult(userId: string, score: number, codeUsed: string, isTrial: boolean) {
    await supabase.from('game_results').insert({
        user_id: userId,
        score,
        code_used: codeUsed,
        played_at: new Date().toISOString()
    });
    
    if (isTrial) {
        await this.useTrial(userId);
    } else if (codeUsed !== 'TRIAL' && codeUsed !== 'ADMIN_TEST') {
        await supabase.from('promo_codes').update({ is_used: true }).eq('code', codeUsed);
    }
  }

  async getUserResults(userId: string): Promise<GameResult[]> {
      const { data, error } = await supabase.from('game_results').select('*').eq('user_id', userId).order('played_at', { ascending: false });
      if (error) return [];
      return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          score: r.score,
          prize: r.prize,
          playedAt: r.played_at,
          codeUsed: r.code_used
      }));
  }

  async getUserUnusedCodes(userId: string): Promise<PromoCode[]> {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('assigned_to', userId)
        .eq('is_used', false)
        .order('generated_at', { ascending: false });
        
    if (error) return [];

    return data.map((c: any) => ({
        code: c.code,
        isUsed: c.is_used,
        isIssued: c.is_issued,
        assignedTo: c.assigned_to,
        generatedAt: c.generated_at,
        invoiceNumber: c.invoice_number,
        purchaseAmount: c.purchase_amount
    }));
  }

  async getUserCodes(userId: string): Promise<PromoCode[]> {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('assigned_to', userId)
        .order('generated_at', { ascending: false });
        
    if (error) return [];

    return data.map((c: any) => ({
        code: c.code,
        isUsed: c.is_used,
        isIssued: c.is_issued,
        assignedTo: c.assigned_to,
        generatedAt: c.generated_at,
        invoiceNumber: c.invoice_number,
        purchaseAmount: c.purchase_amount
    }));
  }

  async validateAndUseCode(code: string, userId: string): Promise<boolean> {
      const { data, error } = await supabase.from('promo_codes').select('*').eq('code', code).single();
      if (error || !data) throw new Error("Неверный код");
      if (data.is_used) throw new Error("Код уже использован");
      if (data.assigned_to && data.assigned_to !== userId) throw new Error("Код принадлежит другому пользователю");
      
      if (!data.assigned_to) {
          await supabase.from('promo_codes').update({ assigned_to: userId }).eq('code', code);
      }
      return true;
  }

  async getAdminStats() {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: gamesCount } = await supabase.from('game_results').select('*', { count: 'exact', head: true });
    const { count: deliveryCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('delivery_requested', true);
    const { count: pendingRequests } = await supabase.from('code_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    const { data: users } = await supabase.from('users').select('*').order('registered_at', { ascending: false });
    const { data: prizes } = await supabase.from('prize_configs').select('*');
    const { data: codes } = await supabase.from('promo_codes').select('*').order('generated_at', { ascending: false });

    const usedCodesCount = codes?.filter((c: any) => c.is_used).length || 0;

    let mappedPrizes: PrizeConfig[] = [];
    if (!prizes || prizes.length === 0) {
        mappedPrizes = INITIAL_PRIZES;
    } else {
        mappedPrizes = prizes.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            icon: p.icon,
            threshold: p.threshold,
            isValuable: p.is_valuable,
            isOutOfStock: p.is_out_of_stock
        }));
    }

    return {
        users: (users || []).map(this.mapUserFromDB),
        prizesConfig: mappedPrizes,
        allCodes: (codes || []).map((c: any) => ({
            code: c.code,
            isUsed: c.is_used,
            isIssued: c.is_issued,
            assignedTo: c.assigned_to,
            generatedAt: c.generated_at,
            invoiceNumber: c.invoice_number,
            purchaseAmount: c.purchase_amount
        })),
        deliveryRequests: deliveryCount || 0,
        pendingRequests: pendingRequests || 0,
        totalUsers: usersCount || 0,
        usedCodes: usedCodesCount,
        totalGames: gamesCount || 0,
        prizesAwarded: {}
    };
  }

  async generateCodes(count: number) {
      const codes = [];
      for(let i=0; i<count; i++) {
          codes.push({
              code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              is_used: false,
              is_issued: false,
              generated_at: new Date().toISOString()
          });
      }
      await supabase.from('promo_codes').insert(codes);
  }

  async issueCodesToUser(userId: string, qty: number, invoice: string, amount: number) {
      const { data: availableCodes } = await supabase.from('promo_codes').select('*').eq('is_issued', false).limit(qty);
      if (!availableCodes || availableCodes.length < qty) {
          const newCodes = [];
          for(let i=0; i<qty; i++) {
            newCodes.push({
                code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                is_used: false,
                is_issued: true,
                assigned_to: userId,
                generated_at: new Date().toISOString(),
                invoice_number: invoice,
                purchase_amount: amount
            });
          }
          await supabase.from('promo_codes').insert(newCodes);
      } else {
          const ids = availableCodes.map((c: any) => c.code);
          await supabase.from('promo_codes').update({
              is_issued: true,
              assigned_to: userId,
              invoice_number: invoice,
              purchase_amount: amount
          }).in('code', ids);
      }
  }

  async addPrize(prize: PrizeConfig) {
      await supabase.from('prize_configs').insert({
          id: prize.id,
          title: prize.title,
          description: prize.description,
          icon: prize.icon,
          threshold: prize.threshold,
          is_valuable: prize.isValuable,
          is_out_of_stock: prize.isOutOfStock
      });
  }

  async updatePrize(prize: PrizeConfig) {
      await supabase.from('prize_configs').upsert({
          id: prize.id,
          title: prize.title,
          description: prize.description,
          icon: prize.icon,
          threshold: prize.threshold,
          is_valuable: prize.isValuable,
          is_out_of_stock: prize.isOutOfStock
      });
  }

  async deletePrize(id: string) {
      await supabase.from('prize_configs').delete().eq('id', id);
  }

  async claimPrize(userId: string, prizeTitle: string): Promise<User> {
      const { data: user } = await supabase.from('users').select('claimed_prizes').eq('id', userId).single();
      const currentClaims = user?.claimed_prizes || [];
      const newClaims = [...currentClaims, prizeTitle];
      
      const { data, error } = await supabase.from('users').update({ claimed_prizes: newClaims }).eq('id', userId).select().single();
      if (error) throw new Error(error.message);
      return this.mapUserFromDB(data);
  }

  async requestDelivery(userId: string) {
      await supabase.from('users').update({ delivery_requested: true }).eq('id', userId);
  }

  // --- Settings ---
  async getOrderPhone(): Promise<string> {
      const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'order_phone').single();
      if (error || !data) return '+992000000000';
      return data.value;
  }

  async updateOrderPhone(phone: string) {
      await supabase.from('app_settings').upsert({ key: 'order_phone', value: phone });
  }

  // --- Code Request / Photo Verification Logic ---

  async uploadCodeRequest(userId: string, photoFile: File) {
    const compressedBase64 = await compressImage(photoFile);
    const { error } = await supabase.from('code_requests').insert({
        user_id: userId,
        photo_data: compressedBase64,
        status: 'pending'
    });
    if (error) throw new Error(error.message);
  }

  async getCodeRequests(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'): Promise<CodeRequest[]> {
      let query = supabase.from('code_requests').select('*');
      if (status !== 'all') {
          query = query.eq('status', status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          photoData: r.photo_data,
          status: r.status,
          adminComment: r.admin_comment,
          invoiceNumber: r.invoice_number,
          purchaseAmount: r.purchase_amount,
          codesIssued: r.codes_issued,
          createdAt: r.created_at
      }));
  }

  async getUserRequestHistory(userId: string): Promise<CodeRequest[]> {
    const { data, error } = await supabase
        .from('code_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return data.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        photoData: r.photo_data,
        status: r.status,
        adminComment: r.admin_comment,
        invoiceNumber: r.invoice_number,
        purchaseAmount: r.purchase_amount,
        codesIssued: r.codes_issued,
        createdAt: r.created_at
    }));
  }

  async processCodeRequest(requestId: string, action: 'approve' | 'reject', payload: { qty?: number, invoice?: string, amount?: number, comment?: string, userId?: string }) {
      if (action === 'approve') {
          if (!payload.qty || !payload.invoice || !payload.userId) throw new Error("Missing data for approval");
          await this.issueCodesToUser(payload.userId, payload.qty, payload.invoice, payload.amount || 0);
          await supabase.from('code_requests').update({
              status: 'approved',
              invoice_number: payload.invoice,
              purchase_amount: payload.amount || 0,
              codes_issued: payload.qty
          }).eq('id', requestId);
      } else {
          await supabase.from('code_requests').update({
              status: 'rejected',
              admin_comment: payload.comment || 'Declined'
          }).eq('id', requestId);
      }
  }

  async deleteCodeRequest(requestId: string) {
      const { error } = await supabase.from('code_requests').delete().eq('id', requestId);
      if (error) throw new Error(error.message);
  }

  async checkUserNotifications(userId: string): Promise<CodeRequest[]> {
      const { data, error } = await supabase
        .from('code_requests')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error || !data) return [];
      return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          photoData: r.photo_data,
          status: r.status,
          adminComment: r.admin_comment,
          invoiceNumber: r.invoice_number,
          purchaseAmount: r.purchase_amount,
          codesIssued: r.codes_issued,
          createdAt: r.created_at
      }));
  }
}

export const backend = new MockBackendService();
