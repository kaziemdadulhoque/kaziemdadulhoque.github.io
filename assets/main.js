const body = document.body;
const nav = document.querySelector('.topbar nav');
const themeButton = document.querySelector('.theme');
const menuButton = document.querySelector('.menu');

if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');
themeButton.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

menuButton.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const navLinks = [...nav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), { rootMargin: '-35% 0px -58% 0px' });
document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));

const experienceCards = document.querySelectorAll('.experience-card');
if (experienceCards[0]) experienceCards[0].id = 'imagine';
if (experienceCards[1]) experienceCards[1].id = 'take-care';

const dialog = document.querySelector('#detail-dialog');
const dialogContent = dialog.querySelector('.dialog-content');
const closeButton = dialog.querySelector('.dialog-close');
const detailCards = document.querySelectorAll('.info-card, .experience-card, .project-card, .certificate');

detailCards.forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open details for ${card.querySelector('h3')?.textContent || 'this item'}`);
  const open = () => {
    dialogContent.innerHTML = `<p class="dialog-label">SELECTED DETAIL</p>${card.innerHTML}`;
    dialog.showModal();
    closeButton.focus();
  };
  card.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    open();
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
  });
});

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.querySelector('#year').textContent = new Date().getFullYear();
