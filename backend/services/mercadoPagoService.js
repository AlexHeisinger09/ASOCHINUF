import axios from 'axios';

// Configurar cliente de Mercado Pago
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_API_URL = 'https://api.mercadopago.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

const mpClient = axios.create({
  baseURL: MP_API_URL,
  headers: {
    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Crear preferencia de pago para una cuota
 * Retorna la URL de Mercado Pago donde redirigir al usuario
 */
export const crearPreferenciaPago = async (cuota, usuario) => {
  try {
    const preference = {
      items: [
        {
          id: `cuota-${cuota.id}`,
          title: `Cuota ${cuota.mes}/${cuota.ano} - ${usuario.nombre} ${usuario.apellido}`,
          quantity: 1,
          unit_price: parseFloat(cuota.monto),
          currency_id: 'CLP'
        }
      ],
      payer: {
        name: usuario.nombre,
        surname: usuario.apellido,
        email: usuario.email
      },
      back_urls: {
        success: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=success&cuota=${cuota.id}`,
        failure: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=failure&cuota=${cuota.id}`,
        pending: `${FRONTEND_URL}/dashboard?tab=cuotas&pago=pending&cuota=${cuota.id}`
      },
      auto_return: 'approved',
      external_reference: `cuota-${cuota.id}`,
      notification_url: `${BACKEND_URL}/api/payments/webhook`,
      statement_descriptor: 'ASOCHINUF Cuota'
    };

    // Hacer llamada a API de Mercado Pago
    const response = await mpClient.post('/checkout/preferences', preference);

    return {
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
      cuotaId: cuota.id,
      montoTotal: parseFloat(cuota.monto)
    };
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error.response?.data || error.message);
    // En desarrollo/testing, retornar un objeto simulado
    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN === 'undefined') {
      console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Retornando preferencia simulada para testing.');
      return {
        id: `pref_test_${Date.now()}`,
        init_point: `${FRONTEND_URL}/payment-processing?cuota=${cuota.id}&test=true`,
        sandbox_init_point: `${FRONTEND_URL}/payment-processing?cuota=${cuota.id}&test=true`,
        cuotaId: cuota.id,
        montoTotal: parseFloat(cuota.monto),
        isTestMode: true
      };
    }
    throw error;
  }
};

/**
 * Verificar estado del pago en Mercado Pago
 */
export const verificarEstadoPago = async (paymentId) => {
  try {
    const response = await mpClient.get(`/v1/payments/${paymentId}`);

    return {
      id: response.data.id,
      status: response.data.status,
      status_detail: response.data.status_detail,
      amount: response.data.transaction_amount,
      external_reference: response.data.external_reference,
      payer_email: response.data.payer?.email
    };
  } catch (error) {
    console.error('Error al verificar pago:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  crearPreferenciaPago,
  verificarEstadoPago
};
