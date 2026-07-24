import type { TQuestionCategoryRaw } from "./types";

export const FAQ_DATA_ES: TQuestionCategoryRaw[] = [
  {
    category: "Funciones",
    description: "Descubre lo que puede hacer la app.",
    icon: "/icons/feature.svg",
    id: 1,
    questions: [
      {
        answer: `1. **Eliminar mensajes/conversaciones creados con la función Chat:**
- En la pestaña **Historial**, pasa el cursor sobre la conversación y selecciona "Eliminar" para borrar una conversación.
- Para eliminar un mensaje individual dentro de la conversación: *aún no disponible*.

2. **Eliminar mensajes/conversaciones creados con la función Asistente:**
- En la pestaña **Asistente**, pasa el cursor sobre el tema y selecciona "Eliminar" para borrar una conversación.
- Eliminación de múltiples temas: *aún no disponible*.`,
        id: 1,
        question: "¿Cómo eliminar mensajes?",
        shortAnswer: `1. **Eliminar mensajes/conversaciones creados con la función Chat:**
- En la pestaña **Historial**, pasa el cursor sobre la conversación y selecciona "Eliminar" para borrar una conversación.
- Para eliminar un mensaje individual dentro de la conversación: *aún no disponible*.

2. **Eliminar mensajes/conversaciones creados con la función Asistente:**`,
      },
      {
        answer: `Por ahora no contamos con esta función automática. Podría implicar recopilar datos y usar espacio en nuestros servidores. Te recomendamos pedirle al chatbot que incluya tu nombre cada vez, según lo necesites.`,
        id: 2,
        question: "¿Cómo hacer que el chatbot use mi nombre en las respuestas?",
      },
      {
        answer: `Aún no disponible en la versión web.`,
        id: 3,
        question: "¿Cómo cambiar el tema o fondo?",
      },
      {
        answer: `Aún no disponible en la versión web.`,
        id: 4,
        question:
          "¿Cómo usar la función de entrada de imagen y el asistente de voz?",
      },
      {
        answer: `En la función Chat, el límite máximo por entrada varía según el modelo y se muestra en la interfaz para usuarios Premium.`,
        id: 5,
        question: "¿Cuál es el límite de palabras por pregunta?",
      },
    ],
  },
  {
    category: "Soluciones rápidas",
    description: "Soluciones rápidas a problemas comunes.",
    icon: "/icons/quick-fix.svg",
    id: 2,
    questions: [
      {
        answer: `Para mantener una conversación fluida, te recomendamos usar **GPT-3.5** por ahora. Estamos trabajando continuamente para mejorar y pronto añadiremos esta función a **GPT-4** en la próxima versión.

---

### Comparación de los modelos GPT:

#### **GPT-3.5**
- **Descripción**: Modelo rápido para conversaciones ágiles y de alta calidad.
- **Razonamiento**: Alto
- **Velocidad**: Alta
- **Concisión**: Alta

#### **GPT-4**
- **Descripción**: Mejor razonamiento y respuestas más precisas, aunque algo más lento.
- **Razonamiento**: Más alto
- **Velocidad**: Media
- **Claridad**: Más alta

---

**Nota**: Este modelo puede generar información inexacta, perjudicial o sesgada en algunos casos y tiene conocimiento limitado de eventos posteriores a 2021.
`,
        id: 1,
        question: "¿Por qué el chatbot no recuerda chats anteriores?",
        shortAnswer: `Para mantener una conversación fluida, te recomendamos usar **GPT-3.5** por ahora. Estamos trabajando continuamente para mejorar y pronto añadiremos esta función a **GPT-4** en la próxima versión.
### Comparación de los modelos GPT:

#### **GPT-3.5**
- **Descripción**: Modelo rápido para conversaciones ágiles y de alta calidad.`,
      },
      {
        answer: `Si te pasa esto, recarga la página o espera unos minutos y vuelve a intentarlo.`,
        id: 2,
        question: "¿Por qué el bot falla o aparece error?",
      },
      {
        answer: `La IA recopila información de distintas fuentes, incluidas algunas no verificadas o antiguas. OpenAI sigue mejorando la precisión, por eso te recomendamos actualizar la aplicación regularmente y revisar las respuestas.

El modelo GPT-3.5 tiene datos hasta septiembre de 2021. Por otro lado, GPT-4 cuenta con datos hasta abril de 2023, pero solo está disponible para usuarios premium.
        `,
        id: 3,
        question:
          "¿Por qué a veces la información es incorrecta o desactualizada?",
      },
      {
        answer: `La versión web actual está disponible solo para **usuarios Premium**. Inicia sesión en la aplicación móvil, crea una cuenta (para vincular tu suscripción) y luego vuelve a la web para usar la versión web.`,
        id: 4,
        question:
          "¿Por qué no puedo acceder desde el sitio web, portátil o PC?",
      },
    ],
  },
  {
    category: "Beneficios Premium",
    description: "Descubre lo que incluye la suscripción premium.",
    icon: "/icons/premium.svg",
    id: 3,
    questions: [
      {
        answer: `- Acceso ilimitado a **GPT-4** u otros modelos más recientes (si están disponibles).
- Límite de texto ampliado hasta **16100 caracteres** por mensaje en la versión web.
- Conversaciones y mensajes ilimitados.
- **Sin anuncios**.`,
        id: 1,
        question: "¿Qué te ofrecemos como miembro Premium?",
      },
      {
        answer: `Sí, **GPT-4** (o el modelo más reciente disponible) y futuras mejoras se activarán automáticamente. No necesitas hacer nada ni pagar extra.`,
        id: 2,
        question:
          "¿La suscripción de por vida incluye futuras actualizaciones?",
      },
      {
        answer:
          "Cuando cambias tu plan de suscripción, el nuevo plan entra en vigor de inmediato. Esto significa que tendrás acceso instantáneo a los beneficios de tu nuevo plan, pero los beneficios restantes de tu plan anterior dejarán de estar disponibles.",
        id: 3,
        question: "¿Qué pasa si cambio mi plan de suscripción?",
      },
      {
        answer:
          "No, cuando cambias a un nuevo plan, tu plan anterior se cancela y es reemplazado de inmediato por el nuevo, incluso si aún no ha expirado. Hacemos esto para asegurarnos de que puedas empezar a disfrutar de tus nuevos beneficios de inmediato.",
        id: 4,
        question:
          "¿Mantengo los beneficios del plan anterior si cambio antes de que expire?",
      },
    ],
  },
  {
    category: "Sobre la aplicación",
    description: "Conoce más sobre la aplicación y su propósito.",
    icon: "/icons/about.svg",
    id: 4,
    questions: [
      {
        answer: `Sí, nuestra aplicación está afiliada a OpenAI como **Enterprise Partner**. Sin embargo, la suscripción es independiente de la del sitio de OpenAI (ChatGPT Plus).`,
        id: 1,
        question: "¿La aplicación está afiliada a OpenAI?",
      },
      {
        answer: `La aplicación utiliza **GPT-4** y **Chat GPT-3.5**. Puedes cambiar entre los modelos Chat **GPT-3.5** y **GPT-4** según tus necesidades.`,
        id: 2,
        question: "¿Qué modelos de chat usa la aplicación?",
      },
    ],
  },
  {
    category: "Facturación",
    description: "Ayuda con pagos y facturas.",
    icon: "/icons/bill.svg",
    id: 5,
    questions: [
      {
        answer: `Por favor, gestiona esto desde la plataforma o dispositivo donde realizaste la compra.
**Ten en cuenta lo siguiente:**

- Desinstalar la aplicación **no cancela tu suscripción** ni detiene los cobros.
- Para suscripciones: se requiere tanto la **cancelación** como la **solicitud de reembolso**.
- Para compras de por vida: solo se requiere la **solicitud de reembolso**.

---

### Cómo cancelar y solicitar un reembolso

#### **En Android**
- **Cancelar**: [Google Play – Cancelar una suscripción](https://support.google.com/googleplay/answer/7018481)
- **Reembolso**: [Google Play – Solicitar un reembolso](https://support.google.com/googleplay/answer/2479637)

#### **En iOS**
- **Cancelar**: [Soporte de Apple – Cancelar una suscripción](https://support.apple.com/en-us/118428)
- **Reembolso**: [Soporte de Apple – Solicitar un reembolso](https://support.apple.com/en-us/118223)

---

### Información adicional

- Los planes de **suscripción y de por vida** se gestionan por separado y no se afectan entre sí.
- Las suscripciones se **renuevan automáticamente** a menos que las canceles **al menos 24 horas antes** del vencimiento.
- El Paquete de por vida es un **producto dentro de la aplicación** (no una suscripción) y **no aparece en el menú de Suscripciones**.
`,
        id: 1,
        question: "Cancelar una suscripción y solicitar un reembolso",
        shortAnswer: `Por favor, gestiona esto desde la plataforma o dispositivo donde realizaste la compra.
**Ten en cuenta lo siguiente:**

- Desinstalar la aplicación **no cancela tu suscripción** ni detiene los cobros.
- Para suscripciones: se requiere tanto la **cancelación** como la **solicitud de reembolso**.`,
      },
      {
        answer: `Por favor, gestiona esto desde la plataforma o dispositivo donde realizaste la compra.
**Ten en cuenta lo siguiente:**

Todos los pagos se realizan a través de **Google Play Store** (Android) o **App Store** (iOS).
Para más detalles sobre los métodos de pago disponibles en tu país, consulta los siguientes artículos:

---

### **En Android**
- **Métodos de pago en Google Play**: [Más información](https://support.google.com/googleplay/answer/2651410)
- **Cómo agregar, eliminar o editar un método de pago en Google Play**: [Más información](https://support.google.com/googleplay/answer/4646404)

---

### **En iOS**
- **Métodos de pago en la App Store**: [Más información](https://support.apple.com/en-us/HT202631)
- **Cómo agregar un método de pago a tu Apple ID**: [Más información](https://support.apple.com/en-us/HT202631)
`,
        id: 2,
        question:
          "Métodos de pago aceptados y cómo agregar o cambiar tu tarjeta",
        shortAnswer: `Por favor, gestiona esto desde la plataforma o dispositivo donde realizaste la compra.
**Ten en cuenta lo siguiente:**

Todos los pagos se realizan a través de **Google Play Store** (Android) o **App Store** (iOS).
Para más detalles sobre los métodos de pago disponibles en tu país, consulta los siguientes artículos:`,
      },
      {
        answer: `### **En iOS**
Cuando compras la aplicación, Apple te enviará una factura/recibo a tu correo electrónico. También puedes acceder a las facturas de compras anteriores realizadas en el App Store de iOS o Mac desde el sitio web de Apple [Reportar un problema](https://reportaproblem.apple.com).

1. Abre el sitio web e inicia sesión con el **Apple ID** utilizado para realizar la compra.
2. El sitio web **Reportar un problema** te permite:
   - Obtener facturas de los servicios de Apple a los que estás suscrito.
   - Hacer clic en "Ver recibo" para acceder a un comprobante completo con toda la información necesaria para fines fiscales.

---

### **En Android**
La dirección que aparece en tu factura o recibo con IVA corresponde a tu **dirección legal en el momento de la compra**.
**Nota**: No es posible cambiar la dirección en una factura o recibo con IVA después de completar la compra.

Para obtener una factura o recibo con IVA:
1. Inicia sesión en: [Configuración de Google Pay](https://pay.google.com/#settings)
2. Verifica que hayas introducido tu **número de identificación fiscal**. Si no lo has hecho, introdúcelo ahora.
   - En algunos países, no es posible obtener una factura o recibo con IVA si el número de identificación fiscal no se introdujo **antes de la compra**.
3. Haz clic en **Actividad** para ver tu historial de compras y facturas.
`,
        id: 3,
        question: "Cómo obtener una factura fiscal (recibo con IVA)",
        shortAnswer: `### **En iOS**
Al comprar, Apple te enviará un recibo a tu correo. También puedes acceder a facturas anteriores desde el sitio [Reportar un problema](https://reportaproblem.apple.com) de Apple.

1. Entra al sitio e inicia sesión con el **Apple ID** usado en la compra.
2. El sitio web **Reportar un problema** te permite:`,
      },
      {
        answer:
          "El cobro del nuevo plan se realiza de inmediato al hacer el cambio, iniciando así un nuevo ciclo de facturación desde esa fecha.",
        id: 4,
        question: "¿Cuándo se me cobrará si compro un nuevo plan?",
      },
      {
        answer: `Lamentablemente, no ofrecemos reembolsos por el tiempo no utilizado del plan anterior al cambiar de plan. El nuevo plan y su precio entran en vigor de inmediato.`,
        id: 5,
        question: "¿Qué pasa con el pago que hice por mi plan anterior?",
      },
      {
        answer:
          "Sí, tu fecha de facturación se reinicia al día en que haces el cambio. Esa nueva fecha será tu fecha de cobro regular para los próximos períodos.",
        id: 6,
        question: "¿Cambia mi fecha de facturación al cambiar de plan?",
      },
      {
        answer:
          "No ofrecemos crédito por el tiempo no utilizado del plan anterior. El nuevo plan se cobra completo y comienza un ciclo de facturación nuevo.",
        id: 7,
        question:
          "Si me paso a un plan más caro, ¿obtengo crédito por el tiempo no usado del plan anterior?",
      },
    ],
  },
  {
    category: "Cuenta",
    description: "Administra la configuración de tu cuenta.",
    icon: "/icons/account.svg",
    id: 6,
    questions: [
      {
        answer: `Puede que te preguntes por qué se te cobra la renovación de una suscripción, incluso si ya compraste otro plan o una suscripción de por vida. O quizás quieras aplicar el tiempo restante de tu suscripción actual a otro plan o a una suscripción de por vida.

---

### **Antes de continuar, ten en cuenta los siguientes puntos de nuestra política de suscripción:**
1. Los paquetes de **suscripción y de por vida** son **independientes** y no se afectan entre sí.
2. Los **diferentes planes de suscripción** también son **independientes** y no se afectan entre sí.
3. Las suscripciones se **renuevan automáticamente** a menos que se cancelen **al menos 24 horas antes** de su fecha de vencimiento.

---

### **Nuestra recomendación para tu caso:**
1. **Cancela tu suscripción actual** para evitar la renovación automática (hazlo al menos 24 horas antes de la fecha de vencimiento).
2. **Solicita un reembolso** por cualquier cargo inesperado (hazlo lo antes posible).
3. **Compra o conserva solo el plan que deseas usar** para evitar confusiones en el futuro.

---

### **Más información**:
[Cancelar o detener una suscripción y solicitar un reembolso](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)
`,
        id: 1,
        question:
          "Cambiar de plan / Renovación automática después de comprar de por vida",
        shortAnswer: `Puede que te preguntes por qué se te cobra la renovación de una suscripción, incluso si ya compraste otro plan o una suscripción de por vida. O quizás quieras aplicar el tiempo restante de tu suscripción actual a otro plan o a una suscripción de por vida.

### **Antes de continuar, ten en cuenta lo siguiente según nuestra política de suscripción:**
1. Los paquetes de **suscripción y de por vida** son **independientes** y no se afectan entre sí.
2. Los **diferentes planes de suscripción** también son **independientes** y no se afectan entre sí.`,
      },
      {
        answer: `
#### **(1) ¿Cuál es la diferencia entre las suscripciones y los planes de por vida?**
Existen dos tipos de compras:
- **Suscripciones** (semanales, mensuales, anuales):
  - Proporcionan acceso completo a Premium por un período determinado.
  - Se **renuevan automáticamente** después de la fecha de vencimiento, a menos que se cancelen.

- **Paquete de por vida**:
  - Proporciona acceso completo a Premium **de por vida**.
  - Requiere un **pago único** y no es una suscripción.

---

#### **(2) ¿Por qué aparecen planes de suscripción similares en el menú Suscripciones?**
- Los precios que se muestran en la pantalla **Gestionar suscripción** son solo para **pruebas** y pueden no aplicarse a tu caso específico.
- Los precios correctos se muestran **en la app** antes de completar la compra (compra dentro de la app).
- El **Paquete de por vida** es un **producto dentro de la app**, no una suscripción. Por lo tanto, no aparecerá en el menú **Gestionar suscripción**.

---

#### **(3) ¿Dónde puedo ver mi compra?**
Si has comprado una suscripción o un Paquete de por vida, aquí puedes revisar los detalles:

**En iOS**:
- Para suscripciones:
  1. Ve a **Configuración** en tu teléfono.
  2. Toca **Apple ID** > **Suscripciones**.

- Para el Paquete de por vida:
  1. Abre la aplicación.
  2. Ve a **Configuración** > **Tienda**.

**En Android**:
- Para suscripciones:
  1. Abre la aplicación **Google Play**.
  2. Toca el **icono de perfil** > **Pagos y suscripciones** > **Suscripciones**.

- Para el Paquete de por vida:
  1. Abre la aplicación.
  2. Ve a **Configuración** > **Tienda**.
`,
        id: 2,
        question:
          "Preguntas frecuentes sobre suscripciones, planes de por vida y compras",
        shortAnswer: `
#### **(1) ¿Cuál es la diferencia entre las suscripciones y los planes de por vida?**
Existen dos tipos de compras:
- **Suscripciones** (semanales, mensuales, anuales):
  - Proporcionan acceso completo a Premium por un período determinado.`,
      },
      {
        answer: `Puedes crear una cuenta usando Facebook, Google o Apple. Si necesitas actualizar o cambiar tu información, hazlo directamente con estos proveedores y utiliza esos datos para iniciar sesión en la app o en el sitio web.`,
        id: 3,
        question:
          "Encontrar mi nombre de usuario y contraseña para iniciar sesión en la aplicación",
      },
      {
        answer: `### **FAQs: Solución de problemas de acceso Premium**

Hay varias razones por las que la aplicación puede no activar tu acceso Premium después de un tiempo o al cambiar de dispositivo. Sigue estos pasos (en orden) para resolver el problema:

---

1. **Asegúrate de iniciar sesión con el correo correcto:**
   - Durante todo el proceso, inicia sesión en **Google Play Store** o **App Store** SOLO con el correo registrado (el mismo que usaste para comprar la aplicación). Esto permitirá que la aplicación reconozca tu acceso Premium.

2. **Verifica tu conexión a Internet:**
   - Asegúrate de que tu conexión sea **estable** para conectarte correctamente con los sistemas de Google o Apple.

3. **Reinstala la aplicación:**
   - Desinstala la aplicación, reinicia tu teléfono y vuelve a instalarla. Luego verifica si el problema se resolvió.

4. **Borra la caché (solo Android):**
   - Si el problema continúa en Android, intenta borrar la caché de la aplicación Google Play Store:
     - Abre la aplicación **Configuración** en tu dispositivo.
     - Ve al **Menú de apps**.
     - Selecciona **Apps instaladas** y busca **Google Play Store**.
     - Ve a la pestaña **Almacenamiento** y selecciona **Borrar almacenamiento** o **Borrar datos de la aplicación**.
     - Reinicia tu teléfono y abre la aplicación nuevamente.

---

Seguir estos pasos debería resolver la mayoría de los problemas relacionados con el acceso Premium. Si el problema continúa, contacta con el equipo de soporte para recibir más ayuda.
`,
        id: 4,
        question: "Sigo viendo anuncios o me piden comprar aunque ya compré",
        shortAnswer: `### **FAQs: Solución de problemas de acceso Premium**
Hay varias razones por las que la app puede no activar tu acceso Premium después de un tiempo o al cambiar de dispositivo. Sigue estos pasos (en orden) para resolver el problema:
1. **Asegúrate de iniciar sesión con el correo correcto:**`,
      },
      {
        answer: `### **FAQs: Prueba gratuita y planes Premium**

#### **Información importante sobre las pruebas gratuitas**
- Una vez que compras cualquier plan Premium en la aplicación, **no podrás usar la prueba gratuita nuevamente**.
- Si intentas suscribirte a la prueba gratuita otra vez, **se te cobrará de inmediato**.

#### **¿Has utilizado antes la prueba gratuita o algún plan Premium?**
Si no estás seguro sobre suscripciones anteriores o tienes dudas sobre cargos durante el período de prueba, ten en cuenta lo siguiente:

1. **Cobro durante la primera prueba:**
   - ¡No te preocupes! Esta transacción es solo para **autorizar tu tarjeta**.
   - El importe se considerará un **depósito** que se aplicará a tu compra cuando finalice el período de prueba.
   - Si cancelas la prueba a tiempo, el importe será reembolsado.

2. **Cómo saber si es tu primera o segunda prueba:**
   - Revisa la pantalla de compra.
     - **Primera prueba:** muestra una fecha de inicio futura (por ejemplo, "comienza el [fecha]").
     - **Segunda prueba:** muestra "comienza hoy" y el cobro se realiza de inmediato.

---

### **¿Necesitas un reembolso?**
Si estás considerando solicitar un reembolso, consulta esta guía para ver las instrucciones detalladas:
[Cancelar o detener una suscripción y solicitar un reembolso](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)

---

### **Artículo relacionado:**
[¿Sigues viendo anuncios o te piden comprar después de haber comprado?](/faq/account/still-ads-and-being-asked-for-buying-when-already-purchased)
`,
        id: 5,
        question:
          "Me registré en la prueba gratuita pero me cobraron de inmediato. ¿Por qué?",
        shortAnswer: `### **FAQs: Prueba gratuita y planes Premium**

#### **Información importante sobre las pruebas gratuitas**
- Una vez que compras cualquier plan Premium en la aplicación, **no podrás usar la prueba gratuita nuevamente**.
- Si intentas suscribirte a la prueba gratuita otra vez, **se te cobrará de inmediato**.`,
      },
      {
        answer: `### **Compra duplicada accidental del upgrade Premium**

Si compraste el **upgrade Premium** dos veces por error, utiliza el enlace a continuación para solicitar un reembolso:
[Cancelar o detener una suscripción y solicitar un reembolso](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)

#### **Información importante:**
- Normalmente, **no es posible comprar la misma suscripción dos veces** usando el mismo Apple ID para el mismo tipo de suscripción al mismo tiempo o antes de que expire la suscripción actual.
- Si te cobraron dos veces por la misma suscripción, por favor envíanos los **recibos** de ambas transacciones. Asegúrate de que incluyan:
  - **Nombre de la app**
  - **Fecha de compra**
  - **Plan de suscripción**

Una vez que recibamos y verifiquemos los recibos, procesaremos tu solicitud de reembolso.

---

### **Contáctanos:**
Para obtener más ayuda, escríbenos por email:
[Soporte por email](mailto:support@vulcanlabs.co)
`,
        id: 6,
        question: "¿Por qué me cobraron dos veces por la aplicación?",
        shortAnswer: `### **Compra duplicada accidental del upgrade Premium**
Si compraste el **upgrade Premium** dos veces por error, utiliza el enlace a continuación para solicitar un reembolso:
[Cancelar o detener una suscripción y solicitar un reembolso](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)

#### **Información importante:**`,
      },
    ],
  },
  {
    category: "Problemas comunes",
    description: "Solución de problemas comunes.",
    icon: "/icons/issue.svg",
    id: 7,
    questions: [
      {
        answer: `Sí, totalmente. Nuestra app está disponible gratis en la versión móvil, aunque con ciertas limitaciones. Los usuarios gratuitos pueden usar la app por tiempo limitado y verán anuncios tipo banner e intersticiales. Por otro lado, los usuarios suscritos pueden disfrutar de una experiencia sin anuncios y sin limitaciones.

Te invitamos a probar nuestro servicio Premium mediante la prueba gratuita, que dura de 3 a 7 días (según la app). Después, se te cobrará la suscripción automáticamente. Puedes cancelarla en cualquier momento, siempre que lo hagas al menos 24 horas antes de que termine el período de prueba.

### Artículos relacionados:
- [Cancelar o detener una suscripción y solicitar un reembolso](/faq/billing/cancel-stop-a-subscription-and-request-a-refund)
- [Cambiar de plan / Renovación automática después de comprar de por vida](/faq/account/change-plans-auto-renewal-when-already-bought-lifetime)

`,
        id: 1,
        question: "¿Puedo usar la app gratis?",
      },
      {
        answer: `Actualmente la app solo está disponible en **inglés**, por lo que no es posible cambiar el idioma. Si necesitas ayuda, puedes contactar a nuestro equipo de soporte en tu idioma preferido y haremos todo lo posible por ayudarte.`,
        id: 2,
        question: "Cambiar el idioma de la aplicación",
      },
      {
        answer: `Nuestra app no es compatible con la función Family Sharing. Sin embargo, los miembros de tu familia pueden usar el servicio Premium si inician sesión con el mismo Apple ID (en iOS) o la misma cuenta de Google (en Android) que se utilizó para comprar la app.
No es posible transferir cuentas Premium entre iOS y Android, ya que utilizan sistemas diferentes.`,
        id: 3,
        question: "¿La aplicación es compatible con Family Sharing?",
      },
      {
        answer: `Para contactar con nuestro equipo de soporte, tienes dos opciones:
1. **Email**: escríbenos a **support@vulcanlabs.co** y descríbenos tu problema.
2. **Chat en vivo**: contáctanos a través del chat disponible dentro de la app móvil.
Ten en cuenta que actualmente no ofrecemos soporte por teléfono.`,
        id: 4,
        question: "¿Cómo puedo obtener ayuda de su equipo?",
      },
    ],
  },
];
