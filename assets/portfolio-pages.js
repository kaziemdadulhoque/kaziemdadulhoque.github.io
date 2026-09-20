(() => {
  const data = window.PORTFOLIO_DATA;
  const params = new URLSearchParams(location.search);
  const mediaRoot = 'assets/portfolio-media/';
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  const categoryById = id => data.categories.find(category => category.id === id);
  const projectById = id => data.projects.find(project => project.id === id);
  const imagePreview = (project, media) => `${mediaRoot}${project.id}/preview/${media[1]}.webp`;
  const imageFull = (project, media) => `${mediaRoot}${project.id}/full/${media[1]}.webp`;
  const videoPath = (project, media) => `${mediaRoot}${project.id}/video/${media[1]}.mp4`;
  const videoPoster = (project, media) => `${mediaRoot}${project.id}/preview/${media[1]}-poster.webp`;

  function renderCollection() {
    const root = document.querySelector('#collection-root');
    if (!root) return;
    const category = categoryById(params.get('category')) || data.categories[0];
    const projects = data.projects.filter(project => project.category === category.id);
    document.title = `${category.title} | Kazi Emdadul Hoque`;
    root.innerHTML = `
      <section class="collection-hero">
        <div><p class="collection-kicker">COLLECTION ${escapeHtml(category.number)}</p><h1>${escapeHtml(category.title)}</h1><p>${escapeHtml(category.subtitle)}</p></div>
        <div class="collection-cover"><img src="${mediaRoot}${escapeHtml(category.cover)}" alt="${escapeHtml(category.title)} featured work"></div>
      </section>
      <section class="collection-body">
        <div class="collection-head"><div><p class="section-kicker">SELECTED WORK</p><h2>${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in this collection</h2></div><span>Choose a project to view its full story and high-resolution media.</span></div>
        <div class="project-list">${projects.map((project,index) => {
          const media = project.media[0];
          const cover = media[0] === 'video' ? videoPoster(project,media) : imagePreview(project,media);
          return `<a class="work-card" href="project.html?id=${encodeURIComponent(project.id)}"><div class="work-image"><img src="${cover}" alt="${escapeHtml(media[2])}" loading="lazy"><span class="work-index">${String(index+1).padStart(2,'0')}</span></div><div class="work-copy"><p>${escapeHtml(project.kicker)}</p><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p><b>View project →</b></div></a>`;
        }).join('')}</div>
      </section>`;
  }

  function renderMedia(project, media, index) {
    const [type, name, title, caption] = media;
    if (type === 'video') {
      return `<article class="media-item"><video controls playsinline preload="metadata" poster="${videoPoster(project,media)}"><source src="${videoPath(project,media)}" type="video/mp4">Your browser does not support HTML5 video.</video><div class="media-note"><span>Full HD video · Original stereo sound</span><span>Press play and use the speaker control for sound.</span></div><div class="media-caption"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(caption)}</p></div></article>`;
    }
    return `<article class="media-item"><button class="media-view" data-full="${imageFull(project,media)}" data-title="${escapeHtml(title)}" aria-label="Open ${escapeHtml(title)} in high resolution"><img src="${imagePreview(project,media)}" alt="${escapeHtml(title)}" ${index ? 'loading="lazy"' : ''}></button><div class="media-note"><span>High-resolution image · Original aspect ratio</span><span>Click image to inspect full size.</span></div><div class="media-caption"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(caption)}</p></div></article>`;
  }

  function renderCaseMedia(project, media, index, compact = false) {
    const [type, name, title, caption] = media;
    if (type === 'video') return renderMedia(project, media, index);
    return `<article class="case-media${compact ? ' case-media--compact' : ''}">
      <button class="media-view" data-full="${imageFull(project,media)}" data-title="${escapeHtml(title)}" aria-label="Open ${escapeHtml(title)} in high resolution">
        <img src="${imagePreview(project,media)}" alt="${escapeHtml(title)}" ${index ? 'loading="lazy"' : ''}>
        <span class="case-zoom">View high resolution ↗</span>
      </button>
      <div class="case-caption"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(caption)}</p></div>
    </article>`;
  }

  function renderCaseStudy(project) {
    return `<section class="case-study" aria-label="BIM project workflow">
      <header class="case-study-intro"><div><p class="section-kicker">END-TO-END PROJECT WORKFLOW</p><h2>One project, developed through a complete digital workflow.</h2></div><p>The case study documents how an early architectural idea was translated into increasingly precise design information—from hand sketch to coordinated BIM documentation and final visualization.</p></header>
      ${project.caseStudy.map(section => {
        const items = section.items.map(index => ({media:project.media[index],index}));
        return `<section class="case-stage case-stage--${escapeHtml(section.layout)}${items.length ? '' : ' case-stage--text-only'}" id="stage-${escapeHtml(section.number)}">
          <div class="case-stage-copy"><span class="case-number">${escapeHtml(section.number)}</span><div><p class="section-kicker">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></div></div>
          ${items.length ? `<div class="case-stage-media">${items.map(({media,index}) => renderCaseMedia(project,media,index,section.layout === 'document')).join('')}</div>` : ''}
        </section>`;
      }).join('')}
    </section>`;
  }

  function renderProject() {
    const root = document.querySelector('#project-root');
    if (!root) return;
    const project = projectById(params.get('id'));
    if (!project) {
      root.innerHTML = '<section class="empty-state"><h1>Project not found</h1><p>Please return to the portfolio and select a project.</p><a href="index.html#projects">Return to portfolio</a></section>';
      return;
    }
    const category = categoryById(project.category);
    const categoryProjects = data.projects.filter(item => item.category === project.category);
    const nextProject = categoryProjects[(categoryProjects.findIndex(item => item.id === project.id) + 1) % categoryProjects.length];
    const first = project.media[0];
    const remainingMedia = project.media.slice(1);
    const hero = first[0] === 'video'
      ? `<video controls playsinline preload="metadata" poster="${videoPoster(project,first)}"><source src="${videoPath(project,first)}" type="video/mp4">Your browser does not support HTML5 video.</video>`
      : `<button class="media-view" data-full="${imageFull(project,first)}" data-title="${escapeHtml(first[2])}" aria-label="Open featured image in high resolution"><img src="${imagePreview(project,first)}" alt="${escapeHtml(first[2])}" fetchpriority="high"></button>`;
    document.title = `${project.title} | Kazi Emdadul Hoque`;
    document.querySelector('#project-back').href = `work.html?category=${encodeURIComponent(category.id)}`;
    document.querySelector('#project-back').textContent = `← ${category.title}`;
    root.innerHTML = `
      <section class="detail-hero">
        <p class="detail-kicker">${escapeHtml(category.title)} · ${escapeHtml(project.kicker)}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="detail-lead">${escapeHtml(project.summary)}</p>
        <div class="detail-facts"><span>${escapeHtml(project.type)}</span>${project.year ? `<span>${escapeHtml(project.year)}</span>` : ''}${project.location ? `<span>${escapeHtml(project.location)}</span>` : ''}${project.area ? `<span>${escapeHtml(project.area)}</span>` : ''}</div>
        <div class="hero-media">${hero}</div>
      </section>
      <section class="project-overview">
        <div class="overview-label"><p class="section-kicker">PROJECT OVERVIEW</p><h2>Purpose, process and contribution.</h2></div>
        <div class="overview-content"><p>${escapeHtml(project.description)}</p><div class="overview-meta"><div><span>My role</span><b>${escapeHtml(project.role)}</b></div><div><span>Tools</span><b>${escapeHtml(project.tools)}</b></div></div>${project.highlights ? `<div class="highlight-list">${project.highlights.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}</div>
      </section>
      ${project.caseStudy ? renderCaseStudy(project) : remainingMedia.length ? `<section class="gallery-section">
        <div class="gallery-heading"><p class="section-kicker">PROJECT MEDIA</p><h2>Explore the work in detail.</h2><p>Images are displayed without changing their original proportions. Select any still to inspect the high-resolution version. Videos include their original sound and standard playback controls.</p></div>
        <div class="media-gallery">${remainingMedia.map((media,index) => renderMedia(project,media,index + 1)).join('')}</div>
      </section>` : ''}
      <section class="next-work"><p class="section-kicker">NEXT IN ${escapeHtml(category.title)}</p><h2>${escapeHtml(nextProject.title)}</h2><a href="project.html?id=${encodeURIComponent(nextProject.id)}">View next project →</a></section>`;
    bindLightbox();
  }

  function bindLightbox() {
    const dialog = document.querySelector('#portfolio-lightbox');
    if (!dialog) return;
    const image = document.querySelector('#lightbox-image');
    const title = document.querySelector('#lightbox-title');
    const link = document.querySelector('#lightbox-original');
    const closeButton = document.querySelector('#lightbox-close');
    document.querySelectorAll('.media-view').forEach(button => button.addEventListener('click', () => {
      image.src = button.dataset.full;
      image.alt = button.dataset.title;
      title.textContent = button.dataset.title;
      link.href = button.dataset.full;
      dialog.showModal();
      closeButton.focus();
    }));
    const close = () => { dialog.close(); image.removeAttribute('src'); };
    closeButton.addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  }

  renderCollection();
  renderProject();
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
