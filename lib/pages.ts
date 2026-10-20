import type { Lang } from './i18n';
import { CAREERS_X, FAQ_LEAD, FAQ_X, PRIVACY_X } from './pages-extra';

export type Block = { h?: string; p?: string[]; ul?: string[] };
export type PageDoc = { title: string; lead: string; blocks: Block[] };
type L2 = { tr: PageDoc; en: PageDoc } & Partial<Record<Lang, PageDoc>>;

const MAIL = 'info@arasmetal.com';

const PRIVACY_BASE: { tr: PageDoc; en: PageDoc } = {
  tr: {
    title: 'Gizlilik politikası',
    lead: 'Aras Metal olarak kişisel verilerinizi 6698 sayılı KVKK ve ilgili mevzuata uygun işleriz. Bu sayfa hangi verileri, neden ve ne kadar süre işlediğimizi açıklar.',
    blocks: [
      { h: 'Veri sorumlusu', p: ['Aras Metal, Adnan Kahveci Mah. Harbiye Cd. No:19, 34528 Beylikdüzü / İstanbul. İletişim: ' + MAIL] },
      { h: 'Hangi verileri topluyoruz', ul: [
        'Katalog ve iletişim formları: ad soyad, e-posta, firma, telefon, ülke ve mesajınız.',
        'Bayi girişi başvurusu: ad soyad, firma, e-posta, telefon ve şifreniz. Şifre düz metin olarak saklanmaz, geri döndürülemez biçimde şifrelenir.',
        'Ziyaret istatistikleri: ziyaret edilen sayfa, dil, ülke, şehir, cihaz, tarayıcı, yönlendiren site, kampanya ve sayfada geçirilen süre. IP adresiniz saklanmaz. Çerezleri reddederseniz ziyaretçi günlük değişen anonim bir kodla sayılır; kabul ederseniz tekrar gelen ziyaretçiyi tanımak için rastgele anonim bir kod saklanır.',
        'Oturum çerezi: yalnızca bayi girişi yaptığınızda, oturumunuzu sürdürmek için tek bir çerez bırakılır.' ] },
      { h: 'Verileri neden işliyoruz', ul: [
        'Katalog, teklif ve bilgi taleplerinize yanıt vermek.',
        'Bayi başvurunuzu değerlendirmek ve onaylanan firmalara ürün sayfalarını açmak.',
        'Siteyi geliştirmek ve güvenliğini sağlamak.',
        'Kariyer başvurularını değerlendirmek.' ] },
      { h: 'Saklama süresi', p: ['Form kayıtları talebin gerektirdiği süre boyunca, bayi kayıtları üyelik sürdükçe saklanır. Ziyaret istatistikleri en fazla 400 gün tutulur. Süre dolunca veriler silinir veya anonim hale getirilir.'] },
      { h: 'Paylaşım', p: ['Verileriniz satılmaz. Altyapı hizmeti sağlayan Supabase (veritabanı) ve Vercel (barındırma) ile yalnızca hizmetin sunulması için işlenir. Yasal zorunluluk halinde yetkili kurumlarla paylaşılabilir.'] },
      { h: 'Haklarınız', p: ['KVKK madde 11 uyarınca verilerinize erişebilir, düzeltilmesini veya silinmesini isteyebilir, işlemeye itiraz edebilirsiniz. Talepleriniz için ' + MAIL + ' adresine yazın. En geç 30 gün içinde yanıt veririz.'] },
    ],
  },
  en: {
    title: 'Privacy policy',
    lead: 'Aras Metal processes your personal data in line with applicable data protection law, including the Turkish KVKK. This page explains what we collect, why, and for how long.',
    blocks: [
      { h: 'Data controller', p: ['Aras Metal, Adnan Kahveci Mah. Harbiye Cd. No:19, 34528 Beylikdüzü / Istanbul, Türkiye. Contact: ' + MAIL] },
      { h: 'What we collect', ul: [
        'Catalog and contact forms: name, email, company, phone, country and your message.',
        'Dealer sign-up: name, company, email, phone and password. Passwords are never stored in plain text; they are irreversibly hashed.',
        'Visit statistics: page viewed, language, country, city, device, browser, referring site, campaign and time spent. Your IP address is not stored. If you decline cookies, visitors are counted with an anonymous code that changes daily; if you accept, a random anonymous code is kept to recognize returning visitors.',
        'Session cookie: only if you sign in as a dealer, a single cookie keeps you signed in.' ] },
      { h: 'Why we process it', ul: [
        'To answer catalog, quote and information requests.',
        'To review dealer applications and give approved companies access to product pages.',
        'To improve and secure the site.',
        'To review job applications.' ] },
      { h: 'Retention', p: ['Form records are kept as long as the request requires, dealer records while the membership lasts. Visit statistics are kept for up to 400 days. After that, data is deleted or anonymized.'] },
      { h: 'Sharing', p: ['We do not sell your data. It is processed only to run the service by our infrastructure providers Supabase (database) and Vercel (hosting). It may be shared with authorities where the law requires.'] },
      { h: 'Your rights', p: ['You may request access to, correction or deletion of your data, and object to its processing. Write to ' + MAIL + '. We reply within 30 days.'] },
    ],
  },
};

const FAQ_BASE: { tr: { q: string; a: string }[]; en: { q: string; a: string }[] } = {
  tr: [
    { q: 'Ürünleri nasıl sipariş edebilirim?', a: 'Sitedeki "Katalog iste" formunu doldurun. Satış ekibimiz katalog ve fiyat bilgisiyle sizinle iletişime geçer.' },
    { q: 'Bayi girişi ne işe yarar?', a: 'Firmanız için "Bayi girişi"nden başvuru yaparsınız. Başvurunuz ekibimizce onaylandığında e-posta ve şifrenizle giriş yapabilirsiniz.' },
    { q: 'Başvurumun durumunu nasıl öğrenirim?', a: 'Onaylanana kadar giriş yaparken başvurunuzun beklediği bilgisi gösterilir. Acil durumda ' + MAIL + ' adresine yazabilirsiniz.' },
    { q: 'Ürünleriniz neden galvaniz çelikten?', a: 'Galvaniz çelik uzun ömürlüdür ve %100 geri dönüştürülebilir. Ev, bahçe ve sofra ürünlerimizde bu nedenle tercih ediyoruz.' },
    { q: 'Showroomunuzu ziyaret edebilir miyim?', a: 'Evet. Beylikdüzü / İstanbul\'daki showroomumuzu ziyaret edebilir veya sitedeki sanal turu başlatabilirsiniz. Ziyaret için önceden iletişime geçmenizi öneririz.' },
    { q: 'Hangi dillerde hizmet veriyorsunuz?', a: 'Site Türkçe, İngilizce, Almanca, Fransızca, İspanyolca ve İtalyanca olarak okunabilir. Dili sağ üstteki dil düğmesinden değiştirebilirsiniz.' },
  ],
  en: [
    { q: 'How can I order products?', a: 'Fill in the "Request catalog" form on the site. Our sales team will contact you with the catalog and pricing.' },
    { q: 'What is dealer sign-in for?', a: 'Apply for your company through "Dealer login". Once our team approves your application, you can sign in with your email and password.' },
    { q: 'How do I check my application?', a: 'Until it is approved, signing in tells you the application is pending. In urgent cases write to ' + MAIL + '.' },
    { q: 'Why galvanized steel?', a: 'Galvanized steel is long lasting and 100% recyclable, which is why we use it for our home, garden and tableware products.' },
    { q: 'Can I visit your showroom?', a: 'Yes. You can visit our showroom in Beylikdüzü / Istanbul or start the virtual tour on the site. Please contact us beforehand to arrange a visit.' },
    { q: 'Which languages are available?', a: 'The site is available in Turkish, English, German, French, Spanish and Italian. Change the language with the language button at the top right.' },
  ],
};

const CAREERS_BASE: { tr: Record<string, string>; en: Record<string, string> } = {
  tr: { title: 'Kariyer', lead: 'Aras Metal ekibine katılmak ister misiniz? Bilgilerinizi ve kendinizi tanıtan kısa bir not bırakın; uygun bir pozisyon olduğunda sizinle iletişime geçelim.', name: 'Ad soyad', email: 'E-posta', phone: 'Telefon', msg: 'Hangi alanda çalışmak istiyorsunuz? Kısaca kendinizden bahsedin', send: 'Başvuruyu gönder', ok: 'Başvurunuz alındı. Teşekkürler.', err: 'Gönderilemedi. Lütfen tekrar deneyin.', fill: 'Lütfen tüm alanları doldurun.', note: 'Başvurunuz yalnızca işe alım sürecinde kullanılır. Ayrıntılar için gizlilik politikasına bakın.' },
  en: { title: 'Careers', lead: 'Would you like to join the Aras Metal team? Leave your details and a short note about yourself, and we will contact you when a suitable role opens.', name: 'Full name', email: 'Email', phone: 'Phone', msg: 'Which area would you like to work in? Tell us a little about yourself', send: 'Send application', ok: 'Your application has been received. Thank you.', err: 'Could not send. Please try again.', fill: 'Please fill in every field.', note: 'Your application is only used for recruitment. See the privacy policy for details.' },
};

export const PRIVACY: L2 = { ...PRIVACY_BASE, ...PRIVACY_X };
export const FAQ: { tr: { q: string; a: string }[]; en: { q: string; a: string }[] } & Partial<Record<Lang, { q: string; a: string }[]>> = { ...FAQ_BASE, ...FAQ_X };
export const CAREERS: { tr: Record<string, string>; en: Record<string, string> } & Partial<Record<Lang, Record<string, string>>> = { ...CAREERS_BASE, ...CAREERS_X };
export { FAQ_LEAD };

export const pick = <T,>(d: { tr: T; en: T } & Partial<Record<Lang, T>>, lang: Lang): T => d[lang] ?? d.en;
