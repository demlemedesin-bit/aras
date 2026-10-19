import type { PageDoc } from './pages';

const MAIL = 'info@arasmetal.com';
const ADDR = 'Adnan Kahveci Mah. Harbiye Cd. No:19, 34528 Beylikdüzü / İstanbul';

export const PRIVACY_X: Record<'de' | 'fr' | 'es' | 'it', PageDoc> = {
  de: {
    title: 'Datenschutzerklärung',
    lead: 'Aras Metal verarbeitet Ihre personenbezogenen Daten gemäß dem geltenden Datenschutzrecht, einschließlich des türkischen KVKK. Diese Seite erklärt, was wir erfassen, warum und wie lange.',
    blocks: [
      { h: 'Verantwortlicher', p: [`Aras Metal, ${ADDR}, Türkei. Kontakt: ${MAIL}`] },
      { h: 'Welche Daten wir erfassen', ul: [
        'Katalog- und Kontaktformulare: Name, E-Mail, Firma, Telefon, Land und Ihre Nachricht.',
        'Händlerregistrierung: Name, Firma, E-Mail, Telefon und Passwort. Passwörter werden nie im Klartext gespeichert, sondern unumkehrbar gehasht.',
        'Besuchsstatistik: aufgerufene Seite, Sprache, Land, Gerätetyp und verweisende Website. Ihre IP-Adresse wird nicht gespeichert und es werden keine Cookies verwendet; Besucher werden über einen anonymen, täglich wechselnden Code gezählt.',
        'Sitzungs-Cookie: Nur wenn Sie sich als Händler anmelden, hält ein einzelnes Cookie Ihre Sitzung aufrecht.' ] },
      { h: 'Wofür wir sie verarbeiten', ul: [
        'Um Katalog-, Angebots- und Informationsanfragen zu beantworten.',
        'Um Händleranträge zu prüfen und freigegebenen Firmen Zugang zu den Produktseiten zu geben.',
        'Um die Website zu verbessern und abzusichern.',
        'Um Bewerbungen zu prüfen.' ] },
      { h: 'Speicherdauer', p: ['Formulardaten werden so lange gespeichert, wie die Anfrage es erfordert, Händlerdaten, solange die Mitgliedschaft besteht. Besuchsstatistiken werden bis zu 400 Tage aufbewahrt. Danach werden die Daten gelöscht oder anonymisiert.'] },
      { h: 'Weitergabe', p: ['Wir verkaufen Ihre Daten nicht. Sie werden ausschließlich zum Betrieb des Dienstes von unseren Infrastrukturanbietern Supabase (Datenbank) und Vercel (Hosting) verarbeitet. Bei gesetzlicher Verpflichtung können sie an Behörden weitergegeben werden.'] },
      { h: 'Ihre Rechte', p: [`Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen und der Verarbeitung widersprechen. Schreiben Sie an ${MAIL}. Wir antworten innerhalb von 30 Tagen.`] },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    lead: 'Aras Metal traite vos données personnelles conformément à la législation applicable en matière de protection des données, y compris la loi turque KVKK. Cette page explique ce que nous collectons, pourquoi et pendant combien de temps.',
    blocks: [
      { h: 'Responsable du traitement', p: [`Aras Metal, ${ADDR}, Turquie. Contact : ${MAIL}`] },
      { h: 'Données collectées', ul: [
        'Formulaires de catalogue et de contact : nom, e-mail, société, téléphone, pays et votre message.',
        'Inscription revendeur : nom, société, e-mail, téléphone et mot de passe. Les mots de passe ne sont jamais conservés en clair, mais hachés de manière irréversible.',
        'Statistiques de visite : page consultée, langue, pays, type d’appareil et site référent. Votre adresse IP n’est pas conservée et aucun cookie n’est utilisé ; les visiteurs sont comptés avec un code anonyme qui change chaque jour.',
        'Cookie de session : uniquement si vous vous connectez en tant que revendeur, un seul cookie maintient votre session.' ] },
      { h: 'Finalités', ul: [
        'Répondre aux demandes de catalogue, de devis et d’informations.',
        'Examiner les demandes de revendeurs et donner accès aux pages produits aux sociétés approuvées.',
        'Améliorer et sécuriser le site.',
        'Examiner les candidatures.' ] },
      { h: 'Durée de conservation', p: ['Les données de formulaire sont conservées aussi longtemps que la demande l’exige, celles des revendeurs tant que l’adhésion dure. Les statistiques de visite sont conservées jusqu’à 400 jours. Ensuite, les données sont supprimées ou anonymisées.'] },
      { h: 'Partage', p: ['Nous ne vendons pas vos données. Elles sont traitées uniquement pour faire fonctionner le service par nos prestataires d’infrastructure Supabase (base de données) et Vercel (hébergement). Elles peuvent être communiquées aux autorités lorsque la loi l’exige.'] },
      { h: 'Vos droits', p: [`Vous pouvez demander l’accès, la rectification ou la suppression de vos données et vous opposer à leur traitement. Écrivez à ${MAIL}. Nous répondons sous 30 jours.`] },
    ],
  },
  es: {
    title: 'Política de privacidad',
    lead: 'Aras Metal trata sus datos personales conforme a la normativa de protección de datos aplicable, incluida la ley turca KVKK. Esta página explica qué recopilamos, por qué y durante cuánto tiempo.',
    blocks: [
      { h: 'Responsable del tratamiento', p: [`Aras Metal, ${ADDR}, Turquía. Contacto: ${MAIL}`] },
      { h: 'Qué datos recopilamos', ul: [
        'Formularios de catálogo y contacto: nombre, correo electrónico, empresa, teléfono, país y su mensaje.',
        'Registro de distribuidores: nombre, empresa, correo electrónico, teléfono y contraseña. Las contraseñas nunca se guardan en texto plano; se almacenan con un hash irreversible.',
        'Estadísticas de visitas: página vista, idioma, país, tipo de dispositivo y sitio de origen. No se guarda su dirección IP ni se usan cookies; los visitantes se cuentan con un código anónimo que cambia cada día.',
        'Cookie de sesión: solo si inicia sesión como distribuidor, una única cookie mantiene su sesión.' ] },
      { h: 'Para qué los tratamos', ul: [
        'Para responder a solicitudes de catálogo, presupuesto e información.',
        'Para revisar las solicitudes de distribuidores y dar acceso a las páginas de producto a las empresas aprobadas.',
        'Para mejorar y proteger el sitio.',
        'Para revisar las candidaturas de empleo.' ] },
      { h: 'Plazo de conservación', p: ['Los datos de los formularios se conservan mientras lo requiera la solicitud y los de distribuidores mientras dure la afiliación. Las estadísticas de visitas se conservan hasta 400 días. Después, los datos se eliminan o se anonimizan.'] },
      { h: 'Comunicación a terceros', p: ['No vendemos sus datos. Solo los tratan, para hacer funcionar el servicio, nuestros proveedores de infraestructura Supabase (base de datos) y Vercel (alojamiento). Pueden comunicarse a las autoridades cuando la ley lo exija.'] },
      { h: 'Sus derechos', p: [`Puede solicitar el acceso, la rectificación o la supresión de sus datos y oponerse a su tratamiento. Escriba a ${MAIL}. Respondemos en un plazo de 30 días.`] },
    ],
  },
  it: {
    title: 'Informativa sulla privacy',
    lead: 'Aras Metal tratta i tuoi dati personali in conformità alla normativa applicabile sulla protezione dei dati, compresa la legge turca KVKK. Questa pagina spiega cosa raccogliamo, perché e per quanto tempo.',
    blocks: [
      { h: 'Titolare del trattamento', p: [`Aras Metal, ${ADDR}, Turchia. Contatto: ${MAIL}`] },
      { h: 'Quali dati raccogliamo', ul: [
        'Moduli di catalogo e contatto: nome, e-mail, azienda, telefono, paese e il tuo messaggio.',
        'Registrazione rivenditori: nome, azienda, e-mail, telefono e password. Le password non vengono mai salvate in chiaro, ma con un hash irreversibile.',
        'Statistiche di visita: pagina visualizzata, lingua, paese, tipo di dispositivo e sito di provenienza. Il tuo indirizzo IP non viene salvato e non si usano cookie; i visitatori sono contati con un codice anonimo che cambia ogni giorno.',
        'Cookie di sessione: solo se accedi come rivenditore, un singolo cookie mantiene attiva la sessione.' ] },
      { h: 'Perché li trattiamo', ul: [
        'Per rispondere a richieste di catalogo, preventivo e informazioni.',
        'Per valutare le richieste dei rivenditori e dare accesso alle pagine prodotto alle aziende approvate.',
        'Per migliorare e proteggere il sito.',
        'Per valutare le candidature di lavoro.' ] },
      { h: 'Conservazione', p: ['I dati dei moduli sono conservati per il tempo richiesto dalla richiesta, quelli dei rivenditori finché dura l’iscrizione. Le statistiche di visita sono conservate fino a 400 giorni. Dopo, i dati vengono eliminati o resi anonimi.'] },
      { h: 'Condivisione', p: ['Non vendiamo i tuoi dati. Sono trattati solo per far funzionare il servizio dai nostri fornitori di infrastruttura Supabase (database) e Vercel (hosting). Possono essere comunicati alle autorità quando la legge lo richiede.'] },
      { h: 'I tuoi diritti', p: [`Puoi chiedere l’accesso, la rettifica o la cancellazione dei tuoi dati e opporti al loro trattamento. Scrivi a ${MAIL}. Rispondiamo entro 30 giorni.`] },
    ],
  },
};

type QA = { q: string; a: string }[];
export const FAQ_X: Record<'de' | 'fr' | 'es' | 'it', QA> = {
  de: [
    { q: 'Wie kann ich Produkte bestellen?', a: 'Füllen Sie das Formular „Katalog anfordern“ auf der Website aus. Unser Vertriebsteam meldet sich mit Katalog und Preisen bei Ihnen.' },
    { q: 'Wofür ist der Händler-Login?', a: 'Bewerben Sie sich mit Ihrer Firma über „Händler-Login“. Sobald unser Team Ihren Antrag freigibt, können Sie sich mit E-Mail und Passwort anmelden.' },
    { q: 'Wie erfahre ich den Stand meines Antrags?', a: `Bis zur Freigabe zeigt die Anmeldung an, dass Ihr Antrag aussteht. In dringenden Fällen schreiben Sie an ${MAIL}.` },
    { q: 'Warum verzinkter Stahl?', a: 'Verzinkter Stahl ist langlebig und zu 100 % recycelbar. Deshalb verwenden wir ihn für unsere Haus-, Garten- und Tischprodukte.' },
    { q: 'Kann ich Ihren Showroom besuchen?', a: 'Ja. Sie können unseren Showroom in Beylikdüzü / Istanbul besuchen oder die virtuelle Tour auf der Website starten. Bitte melden Sie sich vorab für einen Besuch.' },
    { q: 'In welchen Sprachen ist die Website verfügbar?', a: 'Die Website gibt es auf Türkisch, Englisch, Deutsch, Französisch, Spanisch und Italienisch. Die Sprache wechseln Sie mit der Sprachtaste oben rechts.' },
  ],
  fr: [
    { q: 'Comment commander des produits ?', a: 'Remplissez le formulaire « Demander le catalogue » sur le site. Notre équipe commerciale vous contactera avec le catalogue et les tarifs.' },
    { q: 'À quoi sert la connexion revendeur ?', a: 'Candidatez pour votre société via « Connexion revendeur ». Une fois votre demande approuvée par notre équipe, vous pouvez vous connecter avec votre e-mail et votre mot de passe.' },
    { q: 'Comment connaître l’état de ma demande ?', a: `Tant qu’elle n’est pas approuvée, la connexion indique que votre demande est en attente. En cas d’urgence, écrivez à ${MAIL}.` },
    { q: 'Pourquoi l’acier galvanisé ?', a: 'L’acier galvanisé est durable et 100 % recyclable, c’est pourquoi nous l’utilisons pour nos produits de maison, de jardin et d’art de la table.' },
    { q: 'Puis-je visiter votre showroom ?', a: 'Oui. Vous pouvez visiter notre showroom à Beylikdüzü / Istanbul ou lancer la visite virtuelle sur le site. Merci de nous contacter au préalable pour organiser la visite.' },
    { q: 'Dans quelles langues le site est-il disponible ?', a: 'Le site est disponible en turc, anglais, allemand, français, espagnol et italien. Changez de langue avec le bouton de langue en haut à droite.' },
  ],
  es: [
    { q: '¿Cómo puedo pedir productos?', a: 'Rellene el formulario «Pedir catálogo» del sitio. Nuestro equipo comercial le contactará con el catálogo y los precios.' },
    { q: '¿Para qué sirve el acceso de distribuidores?', a: 'Solicite el alta de su empresa en «Acceso distribuidores». Cuando nuestro equipo apruebe su solicitud, podrá iniciar sesión con su correo y contraseña.' },
    { q: '¿Cómo sé el estado de mi solicitud?', a: `Hasta que se apruebe, al iniciar sesión se le indicará que su solicitud está pendiente. En casos urgentes escriba a ${MAIL}.` },
    { q: '¿Por qué acero galvanizado?', a: 'El acero galvanizado es duradero y 100 % reciclable, por eso lo usamos en nuestros productos de hogar, jardín y mesa.' },
    { q: '¿Puedo visitar su showroom?', a: 'Sí. Puede visitar nuestro showroom en Beylikdüzü / Estambul o iniciar la visita virtual en el sitio. Le recomendamos contactarnos antes para concertar la visita.' },
    { q: '¿En qué idiomas está disponible el sitio?', a: 'El sitio está disponible en turco, inglés, alemán, francés, español e italiano. Cambie el idioma con el botón de idioma de la esquina superior derecha.' },
  ],
  it: [
    { q: 'Come posso ordinare i prodotti?', a: 'Compila il modulo «Richiedi il catalogo» sul sito. Il nostro team vendite ti contatterà con catalogo e prezzi.' },
    { q: 'A cosa serve l’accesso rivenditori?', a: 'Candida la tua azienda da «Accesso rivenditori». Quando il nostro team approva la richiesta, potrai accedere con e-mail e password.' },
    { q: 'Come controllo lo stato della mia richiesta?', a: `Finché non è approvata, l’accesso indica che la richiesta è in attesa. In caso di urgenza scrivi a ${MAIL}.` },
    { q: 'Perché l’acciaio zincato?', a: 'L’acciaio zincato è durevole e riciclabile al 100%, per questo lo usiamo per i nostri prodotti per casa, giardino e tavola.' },
    { q: 'Posso visitare il vostro showroom?', a: 'Sì. Puoi visitare il nostro showroom a Beylikdüzü / Istanbul o avviare il tour virtuale sul sito. Ti consigliamo di contattarci prima per organizzare la visita.' },
    { q: 'In quali lingue è disponibile il sito?', a: 'Il sito è disponibile in turco, inglese, tedesco, francese, spagnolo e italiano. Cambia lingua con il pulsante in alto a destra.' },
  ],
};

export const FAQ_LEAD: Record<'tr' | 'en' | 'de' | 'fr' | 'es' | 'it', string> = {
  tr: 'Sık sorulan sorular ve yanıtları.',
  en: 'Frequently asked questions and their answers.',
  de: 'Häufig gestellte Fragen und ihre Antworten.',
  fr: 'Questions fréquentes et leurs réponses.',
  es: 'Preguntas frecuentes y sus respuestas.',
  it: 'Domande frequenti e relative risposte.',
};

type C = Record<string, string>;
export const CAREERS_X: Record<'de' | 'fr' | 'es' | 'it', C> = {
  de: { title: 'Karriere', lead: 'Möchten Sie das Aras-Metal-Team verstärken? Hinterlassen Sie Ihre Daten und eine kurze Vorstellung, wir melden uns, sobald eine passende Stelle frei ist.', name: 'Vollständiger Name', email: 'E-Mail', phone: 'Telefon', msg: 'In welchem Bereich möchten Sie arbeiten? Erzählen Sie kurz von sich', send: 'Bewerbung senden', ok: 'Ihre Bewerbung ist eingegangen. Vielen Dank.', err: 'Senden fehlgeschlagen. Bitte versuchen Sie es erneut.', fill: 'Bitte füllen Sie alle Felder aus.', note: 'Ihre Bewerbung wird nur für den Bewerbungsprozess verwendet. Details finden Sie in der Datenschutzerklärung.' },
  fr: { title: 'Carrières', lead: 'Vous souhaitez rejoindre l’équipe Aras Metal ? Laissez vos coordonnées et une courte présentation, nous vous contacterons lorsqu’un poste adapté sera disponible.', name: 'Nom complet', email: 'E-mail', phone: 'Téléphone', msg: 'Dans quel domaine souhaitez-vous travailler ? Parlez-nous brièvement de vous', send: 'Envoyer la candidature', ok: 'Votre candidature a bien été reçue. Merci.', err: 'Échec de l’envoi. Veuillez réessayer.', fill: 'Veuillez remplir tous les champs.', note: 'Votre candidature n’est utilisée que pour le recrutement. Voir la politique de confidentialité pour plus de détails.' },
  es: { title: 'Empleo', lead: '¿Quiere unirse al equipo de Aras Metal? Déjenos sus datos y una breve presentación, y le contactaremos cuando haya un puesto adecuado.', name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono', msg: '¿En qué área le gustaría trabajar? Cuéntenos brevemente sobre usted', send: 'Enviar candidatura', ok: 'Hemos recibido su candidatura. Gracias.', err: 'No se pudo enviar. Inténtelo de nuevo.', fill: 'Rellene todos los campos.', note: 'Su candidatura solo se usa para la selección de personal. Consulte la política de privacidad para más detalles.' },
  it: { title: 'Lavora con noi', lead: 'Vuoi entrare a far parte del team Aras Metal? Lascia i tuoi dati e una breve presentazione, ti contatteremo quando si libererà una posizione adatta.', name: 'Nome e cognome', email: 'E-mail', phone: 'Telefono', msg: 'In quale area vorresti lavorare? Parlaci brevemente di te', send: 'Invia candidatura', ok: 'Abbiamo ricevuto la tua candidatura. Grazie.', err: 'Invio non riuscito. Riprova.', fill: 'Compila tutti i campi.', note: 'La tua candidatura è usata solo per la selezione del personale. Vedi l’informativa sulla privacy per i dettagli.' },
};
