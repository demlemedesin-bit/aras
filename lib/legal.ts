import type { Lang } from './i18n';
import type { PageDoc } from './pages';

const MAIL = 'info@arasmetal.com';

export const COOKIES: Record<Lang, PageDoc> = {
  tr: { title: 'Çerez politikası', lead: 'Bu site yalnızca sizin onayınızla ölçüm ve reklam çerezleri kullanır. Aşağıda hangi çerez ve tarayıcı depolamasının ne amaçla kullanıldığını bulabilirsiniz.', blocks: [
    { h: 'Zorunlu çerez', ul: ['aras_dealer: yalnızca bayi olarak giriş yaptığınızda bırakılır. Oturumunuzu sürdürür, yalnızca sunucu tarafından okunabilir (HttpOnly), 30 gün sonra sona erer. Çıkış yaptığınızda silinir.'] },
    { h: 'Tarayıcı depolaması', ul: ['aras-lang: seçtiğiniz dili hatırlar. Cihazınızda kalır, bize gönderilmez.', 'aras-consent: çerez tercihinizi hatırlar.', 'aras-sid (oturum depolaması): bir ziyaret sırasındaki sayfaları aynı oturumda toplar, sekme kapanınca silinir.', 'aras-uid (yalnızca onayla): tekrar gelen ziyaretçiyi anonim olarak tanımak için rastgele bir kod. İsim, e-posta veya IP içermez.'] },
    { h: 'Ziyaret istatistikleri', p: ['Çerezleri reddederseniz ziyaretçiler IP adresi saklanmadan, her gün değişen anonim bir kodla sayılır; kalıcı kimlik oluşturulmaz. Kabul ederseniz tekrar gelen ziyaretçi, geldiğiniz kampanya ve sayfalarda geçirdiğiniz süre de ölçülür. Veriler sizi adınızla tanımlamaz.'] },
    { h: 'Üçüncü taraf çerezleri', p: ['Yalnızca çerezleri kabul ederseniz ve site yönetimi bu hizmetleri etkinleştirmişse Google (Analytics, Ads, Tag Manager), Meta (Piksel) veya Microsoft (Clarity) etiketleri yüklenebilir. Reddederseniz hiçbiri yüklenmez. Sayfadaki harita ve bağlantılar kendi sitelerine götürebilir; onların çerez politikaları ayrıca geçerlidir.'] },
    { h: 'Yönetim', p: [`Tercihinizi, tarayıcı verilerini temizleyip siteyi yeniden açarak değiştirebilirsiniz. Çerezleri tarayıcı ayarlarınızdan silebilir veya engelleyebilirsiniz. Zorunlu çerezi engellerseniz bayi girişi çalışmaz. Sorularınız için: ${MAIL}`] },
  ] },
  en: { title: 'Cookie policy', lead: 'This site uses measurement and advertising cookies only with your consent. Below is every cookie and browser storage item we use and why.', blocks: [
    { h: 'Strictly necessary cookie', ul: ['aras_dealer: set only when you sign in as a dealer. It keeps your session, can only be read by the server (HttpOnly) and expires after 30 days. It is removed when you sign out.'] },
    { h: 'Browser storage', ul: ['aras-lang: remembers the language you chose. It stays on your device and is not sent to us.', 'aras-consent: remembers your cookie choice.', 'aras-sid (session storage): groups the pages of one visit, removed when the tab closes.', 'aras-uid (only with consent): a random code that lets us recognise returning visitors anonymously. It contains no name, email or IP address.'] },
    { h: 'Visit statistics', p: ['If you decline, visitors are counted with an anonymous code that changes daily, without storing IP addresses, and no persistent ID is created. If you accept, we also measure returning visitors, the campaign you came from and time spent on pages. The data does not identify you by name.'] },
    { h: 'Third-party cookies', p: ['Only if you accept, and only if the site team has enabled them, tags from Google (Analytics, Ads, Tag Manager), Meta (Pixel) or Microsoft (Clarity) may load. If you decline, none load. The map and links on the page can lead to other sites, whose own cookie policies apply.'] },
    { h: 'Managing cookies', p: [`You can change your choice by clearing your browser data and reopening the site. You can delete or block cookies in your browser settings. If you block the necessary cookie, dealer sign-in will not work. Questions: ${MAIL}`] },
  ] },
  de: { title: 'Cookie-Richtlinie', lead: 'Diese Website verwendet Mess- und Werbe-Cookies nur mit Ihrer Einwilligung. Hier finden Sie alle Cookies und Browser-Speicher, die wir nutzen, und wofür.', blocks: [
    { h: 'Notwendiges Cookie', ul: ['aras_dealer: wird nur gesetzt, wenn Sie sich als Händler anmelden. Es hält Ihre Sitzung aufrecht, ist nur für den Server lesbar (HttpOnly) und läuft nach 30 Tagen ab. Beim Abmelden wird es gelöscht.'] },
    { h: 'Browser-Speicher', ul: ['aras-lang: merkt sich die gewählte Sprache. Sie bleibt auf Ihrem Gerät und wird nicht an uns gesendet.', 'aras-consent: merkt sich Ihre Cookie-Auswahl.', 'aras-sid (Sitzungsspeicher): fasst die Seiten eines Besuchs zusammen, wird beim Schließen des Tabs gelöscht.', 'aras-uid (nur mit Einwilligung): ein Zufallscode, mit dem wir wiederkehrende Besucher anonym erkennen. Er enthält weder Namen, E-Mail noch IP-Adresse.'] },
    { h: 'Besuchsstatistik', p: ['Bei Ablehnung werden Besucher über einen anonymen, täglich wechselnden Code gezählt, ohne IP-Adressen zu speichern; es entsteht keine dauerhafte ID. Bei Zustimmung messen wir zusätzlich wiederkehrende Besucher, die Kampagne und die Verweildauer. Die Daten identifizieren Sie nicht namentlich.'] },
    { h: 'Cookies von Dritten', p: ['Nur bei Ihrer Zustimmung und nur wenn das Team sie aktiviert hat, können Tags von Google (Analytics, Ads, Tag Manager), Meta (Pixel) oder Microsoft (Clarity) geladen werden. Bei Ablehnung wird keines geladen. Karte und Links auf der Seite können zu anderen Websites führen, für die deren eigene Cookie-Richtlinien gelten.'] },
    { h: 'Verwaltung', p: [`Sie können Cookies in den Browsereinstellungen löschen oder blockieren. Blockieren Sie das notwendige Cookie, funktioniert der Händler-Login nicht. Fragen: ${MAIL}`] },
  ] },
  fr: { title: 'Politique relative aux cookies', lead: 'Ce site n’utilise de cookies de mesure et de publicité qu’avec votre consentement. Voici tous les cookies et éléments de stockage du navigateur que nous utilisons, et pourquoi.', blocks: [
    { h: 'Cookie strictement nécessaire', ul: ['aras_dealer : déposé uniquement lorsque vous vous connectez en tant que revendeur. Il maintient votre session, n’est lisible que par le serveur (HttpOnly) et expire après 30 jours. Il est supprimé à la déconnexion.'] },
    { h: 'Stockage du navigateur', ul: ['aras-lang : mémorise la langue choisie. Il reste sur votre appareil et ne nous est pas envoyé.', 'aras-consent : mémorise votre choix de cookies.', 'aras-sid (stockage de session) : regroupe les pages d’une visite, supprimé à la fermeture de l’onglet.', 'aras-uid (uniquement avec consentement) : un code aléatoire permettant de reconnaître anonymement les visiteurs récurrents. Il ne contient ni nom, ni e-mail, ni IP.'] },
    { h: 'Statistiques de visite', p: ['Si vous refusez, les visiteurs sont comptés avec un code anonyme qui change chaque jour, sans conserver les adresses IP, et aucun identifiant persistant n’est créé. Si vous acceptez, nous mesurons aussi les visiteurs récurrents, la campagne d’origine et le temps passé. Ces données ne vous identifient pas nommément.'] },
    { h: 'Cookies tiers', p: ['Uniquement si vous acceptez et si l’équipe du site les a activés, des balises de Google (Analytics, Ads, Tag Manager), Meta (Pixel) ou Microsoft (Clarity) peuvent se charger. Si vous refusez, aucune ne se charge. La carte et les liens de la page peuvent mener vers d’autres sites, dont les propres politiques s’appliquent.'] },
    { h: 'Gestion', p: [`Vous pouvez supprimer ou bloquer les cookies dans les paramètres de votre navigateur. Si vous bloquez le cookie nécessaire, la connexion revendeur ne fonctionnera pas. Questions : ${MAIL}`] },
  ] },
  es: { title: 'Política de cookies', lead: 'Este sitio solo usa cookies de medición y publicidad con su consentimiento. A continuación figuran todas las cookies y el almacenamiento del navegador que usamos y para qué.', blocks: [
    { h: 'Cookie estrictamente necesaria', ul: ['aras_dealer: solo se instala cuando inicia sesión como distribuidor. Mantiene su sesión, solo el servidor puede leerla (HttpOnly) y caduca a los 30 días. Se elimina al cerrar sesión.'] },
    { h: 'Almacenamiento del navegador', ul: ['aras-lang: recuerda el idioma elegido. Permanece en su dispositivo y no se nos envía.', 'aras-consent: recuerda su elección de cookies.', 'aras-sid (almacenamiento de sesión): agrupa las páginas de una visita, se elimina al cerrar la pestaña.', 'aras-uid (solo con consentimiento): un código aleatorio para reconocer de forma anónima a los visitantes que vuelven. No contiene nombre, correo ni IP.'] },
    { h: 'Estadísticas de visitas', p: ['Si rechaza, los visitantes se cuentan con un código anónimo que cambia cada día, sin guardar direcciones IP, y no se crea ningún identificador persistente. Si acepta, también medimos visitantes recurrentes, la campaña de origen y el tiempo en las páginas. Los datos no le identifican por su nombre.'] },
    { h: 'Cookies de terceros', p: ['Solo si acepta y si el equipo del sitio las ha activado, pueden cargarse etiquetas de Google (Analytics, Ads, Tag Manager), Meta (Píxel) o Microsoft (Clarity). Si rechaza, no se carga ninguna. El mapa y los enlaces de la página pueden llevar a otros sitios, cuyas propias políticas de cookies se aplican.'] },
    { h: 'Gestión', p: [`Puede eliminar o bloquear las cookies en la configuración de su navegador. Si bloquea la cookie necesaria, el acceso de distribuidores no funcionará. Consultas: ${MAIL}`] },
  ] },
  it: { title: 'Cookie policy', lead: 'Questo sito usa cookie di misurazione e pubblicitari solo con il tuo consenso. Qui trovi tutti i cookie e gli elementi di archiviazione del browser che usiamo e perché.', blocks: [
    { h: 'Cookie strettamente necessario', ul: ['aras_dealer: impostato solo quando accedi come rivenditore. Mantiene la sessione, è leggibile solo dal server (HttpOnly) e scade dopo 30 giorni. Viene rimosso all’uscita.'] },
    { h: 'Archiviazione del browser', ul: ['aras-lang: ricorda la lingua scelta. Resta sul tuo dispositivo e non ci viene inviata.', 'aras-consent: ricorda la tua scelta sui cookie.', 'aras-sid (archiviazione di sessione): raggruppa le pagine di una visita, viene rimosso alla chiusura della scheda.', 'aras-uid (solo con consenso): un codice casuale che permette di riconoscere in modo anonimo i visitatori che tornano. Non contiene nome, e-mail né IP.'] },
    { h: 'Statistiche di visita', p: ['Se rifiuti, i visitatori sono contati con un codice anonimo che cambia ogni giorno, senza salvare indirizzi IP, e non viene creato alcun ID persistente. Se accetti, misuriamo anche i visitatori che tornano, la campagna di provenienza e il tempo sulle pagine. I dati non ti identificano per nome.'] },
    { h: 'Cookie di terze parti', p: ['Solo se accetti e se il team del sito li ha attivati, possono caricarsi tag di Google (Analytics, Ads, Tag Manager), Meta (Pixel) o Microsoft (Clarity). Se rifiuti, non se ne carica nessuno. La mappa e i link nella pagina possono portare ad altri siti, con le loro cookie policy.'] },
    { h: 'Gestione', p: [`Puoi eliminare o bloccare i cookie dalle impostazioni del browser. Se blocchi il cookie necessario, l’accesso rivenditori non funzionerà. Domande: ${MAIL}`] },
  ] },
};

export const TERMS: Record<Lang, PageDoc> = {
  tr: { title: 'Kullanım koşulları', lead: 'Bu siteyi kullanarak aşağıdaki koşulları kabul etmiş olursunuz.', blocks: [
    { h: 'Site içeriği', p: ['Sitedeki ürün bilgileri, görseller ve metinler bilgilendirme amaçlıdır. Önceden haber vermeden değiştirilebilir. Fiyat ve stok bilgisi için satış ekibimizle iletişime geçin.'] },
    { h: 'Fikri mülkiyet', p: ['Sitedeki marka, logo, görsel ve metinler Aras Metal’e aittir. Yazılı izin olmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.'] },
    { h: 'Bayi hesabı', ul: ['Başvuru bilgilerinin doğru olması sizin sorumluluğunuzdadır.', 'Hesap bilgilerinizi üçüncü kişilerle paylaşmamalısınız.', 'Aras Metal başvuruyu onaylama, reddetme veya erişimi kapatma hakkını saklı tutar.'] },
    { h: 'Sorumluluk sınırı', p: ['Sitenin kesintisiz veya hatasız çalışacağını garanti edemeyiz. Site kullanımından doğan dolaylı zararlardan, yasaların izin verdiği ölçüde sorumlu değiliz.'] },
    { h: 'Bağlantılar', p: ['Sitedeki üçüncü taraf bağlantılarının içeriğinden o sitelerin sahipleri sorumludur.'] },
    { h: 'Uygulanacak hukuk', p: [`Bu koşullar Türk hukukuna tabidir. İstanbul mahkemeleri ve icra daireleri yetkilidir. Sorularınız için: ${MAIL}`] },
  ] },
  en: { title: 'Terms of use', lead: 'By using this site you accept the terms below.', blocks: [
    { h: 'Site content', p: ['Product information, images and text on the site are for information only and may change without notice. Contact our sales team for pricing and stock.'] },
    { h: 'Intellectual property', p: ['The brand, logo, images and text on the site belong to Aras Metal. They may not be copied, reproduced or used commercially without written permission.'] },
    { h: 'Dealer account', ul: ['You are responsible for the accuracy of your application details.', 'Do not share your account details with third parties.', 'Aras Metal may approve, reject or revoke access to any application or account.'] },
    { h: 'Limitation of liability', p: ['We cannot guarantee the site will be uninterrupted or error-free. To the extent the law allows, we are not liable for indirect damages arising from use of the site.'] },
    { h: 'Links', p: ['The owners of third-party sites linked from this site are responsible for their content.'] },
    { h: 'Governing law', p: [`These terms are governed by Turkish law. The courts and enforcement offices of Istanbul have jurisdiction. Questions: ${MAIL}`] },
  ] },
  de: { title: 'Nutzungsbedingungen', lead: 'Mit der Nutzung dieser Website akzeptieren Sie die folgenden Bedingungen.', blocks: [
    { h: 'Inhalte der Website', p: ['Produktinformationen, Bilder und Texte dienen nur der Information und können ohne Vorankündigung geändert werden. Preise und Verfügbarkeit erfragen Sie bitte bei unserem Vertrieb.'] },
    { h: 'Geistiges Eigentum', p: ['Marke, Logo, Bilder und Texte der Website gehören Aras Metal. Ohne schriftliche Genehmigung dürfen sie weder kopiert, vervielfältigt noch kommerziell genutzt werden.'] },
    { h: 'Händlerkonto', ul: ['Sie sind für die Richtigkeit Ihrer Antragsdaten verantwortlich.', 'Geben Sie Ihre Zugangsdaten nicht an Dritte weiter.', 'Aras Metal kann Anträge genehmigen, ablehnen oder den Zugang entziehen.'] },
    { h: 'Haftungsbeschränkung', p: ['Wir können einen unterbrechungs- und fehlerfreien Betrieb nicht garantieren. Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden aus der Nutzung der Website.'] },
    { h: 'Links', p: ['Für die Inhalte verlinkter Drittseiten sind deren Betreiber verantwortlich.'] },
    { h: 'Anwendbares Recht', p: [`Es gilt türkisches Recht. Zuständig sind die Gerichte und Vollstreckungsämter in Istanbul. Fragen: ${MAIL}`] },
  ] },
  fr: { title: 'Conditions d’utilisation', lead: 'En utilisant ce site, vous acceptez les conditions ci-dessous.', blocks: [
    { h: 'Contenu du site', p: ['Les informations produits, images et textes du site sont fournis à titre indicatif et peuvent changer sans préavis. Pour les prix et les stocks, contactez notre équipe commerciale.'] },
    { h: 'Propriété intellectuelle', p: ['La marque, le logo, les images et les textes du site appartiennent à Aras Metal. Ils ne peuvent être copiés, reproduits ou utilisés à des fins commerciales sans autorisation écrite.'] },
    { h: 'Compte revendeur', ul: ['Vous êtes responsable de l’exactitude des informations de votre demande.', 'Ne partagez pas vos identifiants avec des tiers.', 'Aras Metal peut approuver, refuser ou révoquer l’accès à une demande ou un compte.'] },
    { h: 'Limitation de responsabilité', p: ['Nous ne pouvons garantir un fonctionnement ininterrompu ou sans erreur. Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects liés à l’utilisation du site.'] },
    { h: 'Liens', p: ['Les propriétaires des sites tiers vers lesquels le site renvoie sont responsables de leur contenu.'] },
    { h: 'Droit applicable', p: [`Ces conditions sont soumises au droit turc. Les tribunaux et offices d’exécution d’Istanbul sont compétents. Questions : ${MAIL}`] },
  ] },
  es: { title: 'Condiciones de uso', lead: 'Al usar este sitio acepta las siguientes condiciones.', blocks: [
    { h: 'Contenido del sitio', p: ['La información de productos, imágenes y textos del sitio es meramente informativa y puede cambiar sin previo aviso. Para precios y existencias, contacte con nuestro equipo comercial.'] },
    { h: 'Propiedad intelectual', p: ['La marca, el logotipo, las imágenes y los textos del sitio pertenecen a Aras Metal. No pueden copiarse, reproducirse ni usarse con fines comerciales sin permiso por escrito.'] },
    { h: 'Cuenta de distribuidor', ul: ['Usted es responsable de la exactitud de los datos de su solicitud.', 'No comparta los datos de su cuenta con terceros.', 'Aras Metal puede aprobar, rechazar o revocar el acceso a cualquier solicitud o cuenta.'] },
    { h: 'Limitación de responsabilidad', p: ['No podemos garantizar que el sitio funcione sin interrupciones ni errores. En la medida permitida por la ley, no respondemos de daños indirectos derivados del uso del sitio.'] },
    { h: 'Enlaces', p: ['Los propietarios de los sitios de terceros enlazados son responsables de su contenido.'] },
    { h: 'Ley aplicable', p: [`Estas condiciones se rigen por la ley turca. Son competentes los tribunales y oficinas de ejecución de Estambul. Consultas: ${MAIL}`] },
  ] },
  it: { title: 'Condizioni d’uso', lead: 'Usando questo sito accetti le condizioni seguenti.', blocks: [
    { h: 'Contenuti del sito', p: ['Le informazioni sui prodotti, le immagini e i testi del sito hanno scopo informativo e possono cambiare senza preavviso. Per prezzi e disponibilità contatta il nostro team vendite.'] },
    { h: 'Proprietà intellettuale', p: ['Marchio, logo, immagini e testi del sito appartengono ad Aras Metal. Non possono essere copiati, riprodotti o usati a fini commerciali senza autorizzazione scritta.'] },
    { h: 'Account rivenditore', ul: ['Sei responsabile della correttezza dei dati della richiesta.', 'Non condividere i dati del tuo account con terzi.', 'Aras Metal può approvare, rifiutare o revocare l’accesso a qualsiasi richiesta o account.'] },
    { h: 'Limitazione di responsabilità', p: ['Non possiamo garantire che il sito funzioni senza interruzioni o errori. Nei limiti consentiti dalla legge, non rispondiamo dei danni indiretti derivanti dall’uso del sito.'] },
    { h: 'Link', p: ['I proprietari dei siti di terzi collegati sono responsabili dei loro contenuti.'] },
    { h: 'Legge applicabile', p: [`Le presenti condizioni sono regolate dalla legge turca. Sono competenti i tribunali e gli uffici esecutivi di Istanbul. Domande: ${MAIL}`] },
  ] },
};
