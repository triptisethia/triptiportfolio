function MarketZineFlipbook(root, opts){
  var self = this;
  this.root = typeof root === 'string' ? document.querySelector(root) : root;
  this.pages = opts.pages || [];
  this.total = this.pages.length;
  this.mq = window.matchMedia('(max-width:760px)');
  this.mobile = this.mq.matches;
  this.animating = false;
  this.loaded = {};

  /* view state:
     desktop: 0 = cover, 1..(total/2-1) = interior spreads, (total/2) = back cover
     mobile:  1..total = direct page index                                        */
  this.view = this.mobile ? 1 : 0;

  this._buildDOM();
  this._bindEvents();
  this._renderInitial();
}

MarketZineFlipbook.prototype._buildDOM = function(){
  this.root.innerHTML =
    '<div class="mzf-stage">' +
      '<div class="mzf-book-wrap">' +
        '<button class="mzf-arrow mzf-prev" type="button" aria-label="Previous page">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<div class="mzf-book" role="group" aria-label="Zine pages"></div>' +
        '<button class="mzf-arrow mzf-next" type="button" aria-label="Next page">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>';

  this.bookEl  = this.root.querySelector('.mzf-book');
  this.prevBtn = this.root.querySelector('.mzf-prev');
  this.nextBtn = this.root.querySelector('.mzf-next');
  this.stageEl = this.root.querySelector('.mzf-stage');

  this._buildLayout();
};

/* Builds the static slot(s) + reusable flipping leaf for current mobile/desktop mode */
MarketZineFlipbook.prototype._buildLayout = function(){
  this.bookEl.innerHTML = '';
  this.bookEl.classList.toggle('mzf-mobile', this.mobile);

  if(this.mobile){
    this.slotSingle = this._makeSlot('mzf-slot-single');
    this.bookEl.appendChild(this.slotSingle);
  } else {
    this.slotLeft  = this._makeSlot('mzf-slot-left');
    this.slotRight = this._makeSlot('mzf-slot-right');
    this.bookEl.appendChild(this.slotLeft);
    this.bookEl.appendChild(this.slotRight);
  }

  this.leaf = document.createElement('div');
  this.leaf.className = 'mzf-leaf';
  this.leaf.innerHTML =
    '<div class="mzf-face mzf-face-front"><img loading="eager" alt=""/></div>' +
    '<div class="mzf-face mzf-face-back"><img loading="eager" alt=""/></div>';
  this.leaf.style.opacity = '0';
  this.leaf.style.pointerEvents = 'none';
  this.bookEl.appendChild(this.leaf);
  this.leafFrontImg  = this.leaf.querySelector('.mzf-face-front img');
  this.leafBackImg   = this.leaf.querySelector('.mzf-face-back img');
  this.leafBackFace  = this.leaf.querySelector('.mzf-face-back');
};

MarketZineFlipbook.prototype._makeSlot = function(cls){
  var d = document.createElement('div');
  d.className = 'mzf-slot ' + cls;
  var img = document.createElement('img');
  img.loading = 'eager';
  img.alt = '';
  d.appendChild(img);
  return d;
};

MarketZineFlipbook.prototype._src = function(pageNum){
  /* pageNum is 1-indexed */
  return this.pages[pageNum-1];
};

MarketZineFlipbook.prototype._renderInitial = function(){
  if(this.mobile){
    this.slotSingle.querySelector('img').src = this._src(this.view);
  } else {
    if(this.view === 0){
      this.slotRight.querySelector('img').src = this._src(1);
      this.slotRight.style.visibility = 'visible';
      this.slotLeft.style.visibility  = 'hidden';
    } else if(this.view === this._maxView()){
      this.slotRight.querySelector('img').src = this._src(this.total);
      this.slotRight.style.visibility = 'visible';
      this.slotLeft.style.visibility  = 'hidden';
    } else {
      var pair = this._spreadPages(this.view);
      this.slotLeft.querySelector('img').src  = this._src(pair[0]);
      this.slotRight.querySelector('img').src = this._src(pair[1]);
      this.slotLeft.style.visibility  = 'visible';
      this.slotRight.style.visibility = 'visible';
    }
  }
  this._preloadNeighbors();
  var visiblePages = this.mobile ? [this.view] : (this.view === 0 ? [1] : this.view === this._maxView() ? [this.total] : this._spreadPages(this.view));
  var status = this.root.querySelector('.mzf-status');
  if(!status){ status=document.createElement('p'); status.className='mzf-status'; status.setAttribute('role','status'); this.root.appendChild(status); }
  status.textContent='PAGE '+visiblePages.join('–')+' / '+this.total+' · Use arrows or swipe';
  this.bookEl.querySelectorAll('.mzf-slot img').forEach(function(im){ var number=this.pages.indexOf(im.getAttribute('src'))+1;im.alt=number?'Market research zine, page '+number:''; },this);
};

/* returns [leftPageNum, rightPageNum] for a given interior spread index (1..6) */
MarketZineFlipbook.prototype._spreadPages = function(spreadIdx){
  var left = spreadIdx * 2;
  return [left, left+1];
};

MarketZineFlipbook.prototype._maxView = function(){
  return this.mobile ? this.total : (this.total/2);
};

MarketZineFlipbook.prototype._preloadNeighbors = function(){
  var self = this;
  var toLoad = [];
  if(this.mobile){
    toLoad.push(this.view-1, this.view, this.view+1, this.view+2);
  } else {
    var pair = this.view === 0 ? [1] : (this.view === this._maxView() ? [this.total] : this._spreadPages(this.view));
    toLoad.push.apply(toLoad, pair);
    toLoad.push(pair[0]-1, pair[pair.length-1]+1, pair[pair.length-1]+2);
  }
  toLoad.forEach(function(n){
    if(n>=1 && n<=self.total && !self.loaded[n]){
      var im = new Image();
      im.src = self._src(n);
      self.loaded[n] = true;
    }
  });
};

MarketZineFlipbook.prototype._bindEvents = function(){
  var self = this;
  this.prevBtn.addEventListener('click', function(){ self.go(-1); });
  this.nextBtn.addEventListener('click', function(){ self.go(1); });

  this.bookEl.addEventListener('click', function(e){
    if(self.animating) return;
    if(e.target.closest('.mzf-leaf')) return;
    var rect = self.bookEl.getBoundingClientRect();
    var x = e.clientX - rect.left;
    if(x > rect.width/2){ self.go(1); } else { self.go(-1); }
  });

  /* drag support (only within bounds; boundary crossing is handled via arrows/tap) */
  var dragging = false, startX = 0, dir = 0;
  this.bookEl.addEventListener('pointerdown', function(e){
    if(self.animating) return;
    dragging = true; startX = e.clientX;
    var rect = self.bookEl.getBoundingClientRect();
    dir = (e.clientX - rect.left) > rect.width/2 ? 1 : -1;
  });
  window.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var dx = e.clientX - startX;
    if(Math.abs(dx)>6) self._dragPreview(dir, dx);
  });
  window.addEventListener('pointerup', function(e){
    if(!dragging) return;
    dragging = false;
    var dx = e.clientX - startX;
    self._dragEnd(dir, dx);
  });

  this.mq.addEventListener ? this.mq.addEventListener('change', function(){ self._handleModeChange(); })
                            : this.mq.addListener(function(){ self._handleModeChange(); });

  window.addEventListener('keydown', function(e){
    if(!self.root.contains(document.activeElement) || document.querySelector('dialog[open]')) return; if(e.key === 'ArrowRight' || e.key === 'ArrowLeft') e.preventDefault();
    if(e.key === 'ArrowRight') self.go(1);
    if(e.key === 'ArrowLeft')  self.go(-1);
  });
};

MarketZineFlipbook.prototype._isInViewport = function(){
  var r = this.root.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

MarketZineFlipbook.prototype._handleModeChange = function(){
  var wasMobile = this.mobile;
  this.mobile = this.mq.matches;
  if(wasMobile === this.mobile) return;
  var currentPage = wasMobile ? this.view : (this.view===0?1:(this.view===this.total/2?this.total:this._spreadPages(this.view)[0]));
  this.animating=false;
  this._buildLayout();
  if(this.mobile){
    this.view = currentPage;
  } else {
    if(currentPage <= 1) this.view = 0;
    else if(currentPage >= this.total) this.view = this._maxView();
    else this.view = Math.floor(currentPage/2);
  }
  this._renderInitial();
};

MarketZineFlipbook.prototype._dragPreview = function(dir, dx){
  if(this.animating) return;
  var canNext = this.view < this._maxView();
  var canPrev = this.view > (this.mobile?1:0);
  if(dir === 1 && !canNext) return;
  if(dir === -1 && !canPrev) return;

  if(!this.leaf.classList.contains('mzf-dragging')){
    this._prepFlip(dir === 1 ? 'next' : 'prev');
    this.leaf.classList.add('mzf-dragging');
  }
  var width = this.mobile ? this.slotSingle.getBoundingClientRect().width : this.slotRight.getBoundingClientRect().width;
  var progress = Math.max(0, Math.min(1, Math.abs(dx)/width));
  var deg = dir === 1 ? -180*progress : -180*(1-progress);
  if(dir === -1){
    deg = -180 + (180*progress);
  }
  this.leaf.style.transition = 'none';
  this.leaf.style.transform = 'rotateY(' + deg + 'deg)';
  this._lastDragProgress = progress;
  this._lastDragDir = dir;
};

MarketZineFlipbook.prototype._dragEnd = function(dir, dx){
  if(!this.leaf.classList.contains('mzf-dragging')) return;
  this.leaf.classList.remove('mzf-dragging');
  var progress = this._lastDragProgress || 0;
  if(progress > 0.35){
    this._finishFlip(dir === 1 ? 'next' : 'prev');
  } else {
    this._cancelFlip(dir === 1 ? 'next' : 'prev');
  }
};

/* Public: go(1) = next, go(-1) = prev. Loops continuously at both ends. */
MarketZineFlipbook.prototype.go = function(dir){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var low=this.mobile?1:0, high=this._maxView();this.view+=dir;if(this.view>high)this.view=low;if(this.view<low)this.view=high;this.animating=false;this._renderInitial();return;
  }
  if(this.animating) return;
  var atLastPage  = this.view >= this._maxView();
  var atFirstPage = this.view <= (this.mobile ? 1 : 0);

  if(dir === 1 && atLastPage){ this._wrapClose('forward'); return; }
  if(dir === -1 && atFirstPage){ this._wrapClose('backward'); return; }

  var kind = dir === 1 ? 'next' : 'prev';
  this._prepFlip(kind);
  this._finishFlip(kind);
};

/* Prepares the leaf element with correct images/orientation for a flip, without starting the animated transition */
MarketZineFlipbook.prototype._prepFlip = function(kind){
  this.animating = true;
  this.leafBackFace.classList.remove('mzf-blank');

  if(this.mobile){
    var cur = this.view;
    var targetPage = kind === 'next' ? cur+1 : cur-1;
    if(kind === 'next'){
      this.leaf.style.transformOrigin = 'left center';
      this.leafFrontImg.src = this._src(cur);
      this.leafBackImg.src  = this._src(targetPage);
      this._placeLeaf(this.slotSingle);
      this.leaf.style.transition = 'none';
      this.leaf.style.transform = 'rotateY(0deg)';
      this._pendingStatic = { page: targetPage };
    } else {
      this.leaf.style.transformOrigin = 'left center';
      this.leafFrontImg.src = this._src(targetPage);
      this.leafBackImg.src  = this._src(cur);
      this._placeLeaf(this.slotSingle);
      this.leaf.style.transition = 'none';
      this.leaf.style.transform = 'rotateY(-180deg)';
      this._pendingStatic = { page: targetPage };
    }
  } else {
    if(kind === 'next'){
      var curRight = this.view===0 ? 1 : this._spreadPages(this.view)[1];
      var nextRight, nextLeft;
      if(this.view === 0){
        nextLeft = 2; nextRight = 3;
      } else if(this.view+1 === this._maxView()){
        nextLeft = null; nextRight = this.total; /* going to back cover, single */
      } else {
        var p = this._spreadPages(this.view+1);
        nextLeft = p[0]; nextRight = p[1];
      }
      this.leaf.style.transformOrigin = 'left center';
      this.leafFrontImg.src = this._src(curRight);
      this.leafBackImg.src  = this._src(nextLeft || curRight);
      this._placeLeaf(this.slotRight);
      this.leaf.style.transition = 'none';
      this.leaf.style.transform = 'rotateY(0deg)';
      if(nextRight){ this.slotRight.querySelector('img').src = this._src(nextRight); }
      this._pendingStatic = { left: nextLeft, right: nextRight };
    } else {
      var curLeft = this.view===this._maxView() ? null : this._spreadPages(this.view)[0];
      var prevLeft, prevRight;
      if(this.view === 1){
        prevLeft = null; prevRight = 1; /* back to cover */
      } else if(this.view === this._maxView()){
        var p2 = this._spreadPages(this.view-1);
        prevLeft = p2[0]; prevRight = p2[1];
        curLeft = null;
      } else {
        var p3 = this._spreadPages(this.view-1);
        prevLeft = p3[0]; prevRight = p3[1];
      }
      var leftContent = (this.view===this._maxView()) ? this.total : curLeft;
      this.leaf.style.transformOrigin = 'right center';
      this.leafFrontImg.src = this._src(prevRight);
      this.leafBackImg.src  = this._src(leftContent);
      this._placeLeaf(this.slotLeft);
      this.leaf.style.transition = 'none';
      this.leaf.style.transform = 'rotateY(-180deg)';
      if(prevLeft){ this.slotLeft.querySelector('img').src = this._src(prevLeft); }
      else { this.slotLeft.style.visibility = 'hidden'; }
      this._pendingStatic = { left: prevLeft, right: prevRight };
    }
  }
  this.leaf.style.opacity = '1';
  this.leaf.style.pointerEvents = 'auto';
  void this.leaf.offsetWidth; /* reflow */
};

MarketZineFlipbook.prototype._placeLeaf = function(referenceSlot){
  var rect = referenceSlot.getBoundingClientRect();
  var bookRect = this.bookEl.getBoundingClientRect();
  this.leaf.style.position = 'absolute';
  this.leaf.style.top = '0';
  this.leaf.style.left = (rect.left - bookRect.left) + 'px';
  this.leaf.style.width = rect.width + 'px';
  this.leaf.style.height = rect.height + 'px';
  this.leaf.classList.remove('mzf-leaf-left','mzf-leaf-right','mzf-leaf-single');
  if(referenceSlot === this.slotLeft) this.leaf.classList.add('mzf-leaf-left');
  else if(referenceSlot === this.slotRight) this.leaf.classList.add('mzf-leaf-right');
  else this.leaf.classList.add('mzf-leaf-single');
};

MarketZineFlipbook.prototype._finishFlip = function(kind){
  var self = this;
  var targetDeg = kind === 'next' ? -180 : 0;
  requestAnimationFrame(function(){
    self.leaf.style.transition = 'transform .68s cubic-bezier(.4,.05,.2,1)';
    self.leaf.style.transform = 'rotateY(' + targetDeg + 'deg)';
  });
  var done = function(){
    self.leaf.removeEventListener('transitionend', done);
    self._settleFlip(kind);
  };
  this.leaf.addEventListener('transitionend', done);
};

MarketZineFlipbook.prototype._cancelFlip = function(kind){
  var self = this;
  var backDeg = kind === 'next' ? 0 : -180;
  requestAnimationFrame(function(){
    self.leaf.style.transition = 'transform .35s ease';
    self.leaf.style.transform = 'rotateY(' + backDeg + 'deg)';
  });
  var done = function(){
    self.leaf.removeEventListener('transitionend', done);
    self.leaf.style.opacity = '0';
    self.leaf.style.pointerEvents = 'none';
    self.animating = false;
    if(!self.mobile){ self.slotLeft.style.visibility = 'visible'; }
  };
  this.leaf.addEventListener('transitionend', done);
};

MarketZineFlipbook.prototype._settleFlip = function(kind){
  if(this.mobile){
    this.view = this._pendingStatic.page;
    this.slotSingle.querySelector('img').src = this._src(this.view);
  } else {
    if(kind === 'next'){
      this.view = this.view + 1;
      if(this._pendingStatic.left){
        this.slotLeft.querySelector('img').src = this._src(this._pendingStatic.left);
        this.slotLeft.style.visibility = 'visible';
      } else {
        this.slotLeft.style.visibility = 'hidden';
      }
    } else {
      this.view = this.view - 1;
      if(this.view === 0){
        this.slotLeft.style.visibility = 'hidden';
        this.slotRight.querySelector('img').src = this._src(1);
      } else {
        this.slotRight.querySelector('img').src = this._src(this._pendingStatic.right);
        this.slotLeft.style.visibility = 'visible';
      }
    }
  }
  this.leaf.style.transition = 'none';
  this.leaf.style.opacity = '0';
  this.leaf.style.pointerEvents = 'none';
  this.leaf.style.transform = 'rotateY(0deg)';
  this.animating = false;
  this._preloadNeighbors();
  var visiblePages = this.mobile ? [this.view] : (this.view === 0 ? [1] : this.view === this._maxView() ? [this.total] : this._spreadPages(this.view));
  var status = this.root.querySelector('.mzf-status');
  if(!status){ status=document.createElement('p'); status.className='mzf-status'; status.setAttribute('role','status'); this.root.appendChild(status); }
  status.textContent='PAGE '+visiblePages.join('–')+' / '+this.total+' · Use arrows or swipe';
  this.bookEl.querySelectorAll('.mzf-slot img').forEach(function(im){ var number=this.pages.indexOf(im.getAttribute('src'))+1;im.alt=number?'Market research zine, page '+number:''; },this);
};

/* Book-closing loop transition.
   'forward'  — last page closes shut toward the left, then reopens at the cover.
   'backward' — the cover closes shut toward the right, then reopens at the back cover. */
MarketZineFlipbook.prototype._wrapClose = function(direction){
  var self = this;
  this.animating = true;
  this.leafBackFace.classList.add('mzf-blank');
  this.leafBackImg.removeAttribute('src');

  var referenceSlot = this.mobile ? this.slotSingle : this.slotRight;
  var currentPage = this.mobile ? this.view : this.total; /* what's currently showing on that slot */
  var fromDeg, toDeg, origin;

  if(direction === 'forward'){
    origin = 'left center'; fromDeg = 0; toDeg = -180;
    this.leafFrontImg.src = this._src(currentPage);
  } else {
    origin = 'right center'; fromDeg = 0; toDeg = 180;
    this.leafFrontImg.src = this._src(this.mobile ? this.view : 1);
  }

  this.leaf.style.transformOrigin = origin;
  this._placeLeaf(referenceSlot);
  this.leaf.style.transition = 'none';
  this.leaf.style.transform = 'rotateY(' + fromDeg + 'deg)';
  this.leaf.style.opacity = '1';
  this.leaf.style.pointerEvents = 'auto';
  void this.leaf.offsetWidth;

  requestAnimationFrame(function(){
    self.leaf.style.transition = 'transform .6s cubic-bezier(.4,.05,.2,1)';
    self.leaf.style.transform = 'rotateY(' + toDeg + 'deg)';
  });

  var done = function(){
    self.leaf.removeEventListener('transitionend', done);
    setTimeout(function(){ self._settleWrap(direction); }, 140);
  };
  this.leaf.addEventListener('transitionend', done);
};

MarketZineFlipbook.prototype._settleWrap = function(direction){
  this.leaf.style.transition = 'none';
  this.leaf.style.opacity = '0';
  this.leaf.style.pointerEvents = 'none';
  this.leaf.style.transform = 'rotateY(0deg)';
  this.leafBackFace.classList.remove('mzf-blank');

  this.view = direction === 'forward' ? (this.mobile ? 1 : 0) : this._maxView();
  this._renderInitial();
  this.animating = false;
};



/* ══════════════════════════
   MARKET ZINE FLIPBOOK INIT
══════════════════════════ */
(function(){
  var mount = document.getElementById('thelaZineFlipbook');
  if(!mount) return;
  new MarketZineFlipbook(mount, {
    pages: [
    'assets/dfefb14c66edb9a4.jpg',
    'assets/ffc19ea8d865d16f.jpg',
    'assets/bad719e994b041b4.jpg',
    'assets/3685f7e7ecaac665.jpg',
    'assets/9239d2cd4d9751f0.jpg',
    'assets/0ca273a3aeeef81c.jpg',
    'assets/0e5a1761440b6d08.jpg',
    'assets/8633117f091f69f1.jpg',
    'assets/31db6d29faadf8ba.jpg',
    'assets/d84a3ccd5fc78af9.jpg',
    'assets/b8c8a7e7344a0a07.jpg',
    'assets/d3e331d66f348b36.jpg',
    'assets/261bad7b1c15a89d.jpg',
    'assets/cc8598d65b6ffc0e.jpg'
    ]
  });
})();


(function AlignRParts(){
  var DATA = {"mpu": {"n": "MPU 6050", "r": "Motion sensor", "d": "Measures acceleration and tilt, so the board can tell when your upper back tips forward."}, "uno": {"n": "Arduino Uno", "r": "Microcontroller board", "d": "Reads the sensor, compares the angle with the slouch threshold and runs the 10-second timer."}, "oled": {"n": "OLED screen", "r": "Visual feedback", "d": "Shows the posture reading on a small screen."}, "buzz": {"n": "Buzzer", "r": "Sound alert", "d": "Beeps once a slouch has lasted more than 10 seconds, prompting you to sit up."}};
  var circ = document.getElementById('dlCircuit');
  if(circ){
    var card = circ.querySelector('.dl-part-card');
    var role = document.getElementById('dlPartRole'), name = document.getElementById('dlPartName'), desc = document.getElementById('dlPartDesc');
    function select(k){
      var d = DATA[k]; if(!d) return;
      circ.querySelectorAll('[data-part]').forEach(function(el){ el.classList.toggle('active', el.getAttribute('data-part') === k); });
      card.classList.remove('in');
      setTimeout(function(){
        role.textContent = d.r; name.textContent = d.n; desc.textContent = d.d;
        card.classList.add('in');
      }, 140);
    }
    circ.querySelectorAll('[data-part]').forEach(function(el){
      el.addEventListener('click', function(){ select(el.getAttribute('data-part')); });
    });
    select('mpu');
  }
  var comps = document.getElementById('dlComps');
  if(comps){
    comps.querySelectorAll('.dl-comp').forEach(function(c){
      c.addEventListener('click', function(){
        comps.querySelectorAll('.dl-comp').forEach(function(o){ o.classList.toggle('active', o === c); });
      });
    });
  }
})();

/* AlignR: "how it works" demo. Drag the person forward to slouch;
   past the slouch line a ring fills, then the patch buzzes. */
(function SlouchDemo(){
  var svg = document.getElementById('slSvg');
  if(!svg) return;
  var page = document.getElementById('page-posture');
  var wrap = document.getElementById('slDemo');
  var spine = document.getElementById('slSpine'), arm = document.getElementById('slArm'), head = document.getElementById('slHead');
  var patchG = document.getElementById('slPatchG'), ring = document.getElementById('slRing'), deg = document.getElementById('slDeg');
  var slouchLine = document.getElementById('slSlouchLine');
  var range = document.getElementById('slRange'), status = document.getElementById('slStatus');
  var steps = document.querySelectorAll('#slSteps li');

  var H = { x: 130, y: 174 }, HAND = { x: 262, y: 147 };
  var THRESH = 18, HOLD = 4000;
  var RING = 2 * Math.PI * 17;
  ring.style.strokeDasharray = RING;
  ring.style.strokeDashoffset = RING;

  function lerp(a, b, t){ return a + (b - a) * t; }
  function P(a, b, t){ return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function bez(p0, p1, p2, p3, u){
    var m = 1 - u;
    return { x: m*m*m*p0.x + 3*m*m*u*p1.x + 3*m*u*u*p2.x + u*u*u*p3.x,
             y: m*m*m*p0.y + 3*m*m*u*p1.y + 3*m*u*u*p2.y + u*u*u*p3.y };
  }
  function bezT(p0, p1, p2, p3, u){
    var m = 1 - u;
    return { x: 3*m*m*(p1.x-p0.x) + 6*m*u*(p2.x-p1.x) + 3*u*u*(p3.x-p2.x),
             y: 3*m*m*(p1.y-p0.y) + 6*m*u*(p2.y-p1.y) + 3*u*u*(p3.y-p2.y) };
  }
  function geom(t){
    var N = P({ x: 127, y: 94 }, { x: 173, y: 108 }, t);
    var C1 = P({ x: 129, y: 146 }, { x: 121, y: 152 }, t);
    var C2 = P({ x: 127, y: 118 }, { x: 147, y: 84 }, t);
    var dir = P({ x: 0, y: -1 }, { x: .9, y: .2 }, t);
    var dl = Math.hypot(dir.x, dir.y);
    return { N: N, C1: C1, C2: C2, head: { x: N.x + dir.x / dl * 22, y: N.y + dir.y / dl * 22 } };
  }
  function rawAngle(g){ return Math.atan2(g.N.x - H.x, H.y - g.N.y) * 180 / Math.PI; }
  var A0 = rawAngle(geom(0)), A1 = rawAngle(geom(1));

  // slouch line drawn at the threshold angle
  var tr = (A0 + THRESH) * Math.PI / 180;
  slouchLine.setAttribute('x2', (H.x + 122 * Math.sin(tr)).toFixed(1));
  slouchLine.setAttribute('y2', (H.y - 122 * Math.cos(tr)).toFixed(1));

  var cur = 0, target = 0, dragging = false, rangeActive = false;
  var overSince = null, buzzing = false, lastStep = -1, lastStatus = '';

  function render(){
    var g = geom(cur);
    var f = function(p){ return p.x.toFixed(1) + ' ' + p.y.toFixed(1); };
    spine.setAttribute('d', 'M' + f(H) + ' C ' + f(g.C1) + ' ' + f(g.C2) + ' ' + f(g.N));
    head.setAttribute('cx', g.head.x.toFixed(1));
    head.setAttribute('cy', g.head.y.toFixed(1));
    var S = bez(H, g.C1, g.C2, g.N, .86);
    var E = { x: lerp(S.x, HAND.x, .5), y: Math.max(S.y + 30, HAND.y + 8) };
    arm.setAttribute('d', 'M' + f(S) + ' L ' + f(E) + ' L ' + f(HAND));
    var p = bez(H, g.C1, g.C2, g.N, .62), tg = bezT(H, g.C1, g.C2, g.N, .62);
    var tl = Math.hypot(tg.x, tg.y), nb = { x: tg.y / tl, y: -tg.x / tl };
    var pc = { x: p.x + nb.x * 7, y: p.y + nb.y * 7 };
    var rot = Math.atan2(tg.y, tg.x) * 180 / Math.PI + 90;
    patchG.setAttribute('transform', 'translate(' + f(pc).replace(' ', ',') + ') rotate(' + rot.toFixed(1) + ')');
    var a = Math.max(0, rawAngle(g) - A0);
    deg.textContent = Math.round(a) + '°';
    return a;
  }

  function setStatus(txt){ if(txt !== lastStatus){ status.textContent = txt; lastStatus = txt; } }

  function tick(now){
    requestAnimationFrame(tick);
    if(page && !page.classList.contains('active')){ overSince = null; return; }
    var k = dragging || rangeActive ? .35 : .12;
    cur += (target - cur) * k;
    if(Math.abs(target - cur) < .0005) cur = target;
    var a = render();
    var over = a > THRESH, held = 0;
    svg.classList.toggle('over', over);
    if(over){
      if(overSince === null) overSince = now;
      held = now - overSince;
      ring.style.strokeDashoffset = (RING * (1 - Math.min(1, held / HOLD))).toFixed(2);
      if(held >= HOLD && !buzzing){
        buzzing = true;
        if(navigator.vibrate){ try{ navigator.vibrate([120, 80, 120]); }catch(e){} }
      }
    } else {
      overSince = null; buzzing = false;
      ring.style.strokeDashoffset = RING;
    }
    svg.classList.toggle('buzz', buzzing);
    wrap.classList.toggle('buzz', buzzing);
    var step = !over ? 0 : (held < 700 ? 1 : (buzzing ? 3 : 2));
    if(step !== lastStep){
      lastStep = step;
      steps.forEach(function(li, i){ li.classList.toggle('active', i === step); });
    }
    var A = Math.round(a);
    if(step === 0) setStatus(A < 4 ? 'Sitting upright. Drag the person forward to slouch.' : 'Leaning in a little (' + A + '°). That’s fine, nothing happens yet.');
    else if(step === 1) setStatus('Past the slouch line (' + A + '°).');
    else if(step === 2) setStatus('Still slouching… ' + Math.max(1, Math.ceil((HOLD - held) / 1000)) + 's');
    else setStatus('Slouched too long. AlignR buzzes. Sit back up to stop it.');
    if(!rangeActive) range.value = Math.round(cur * 100);
  }

  function svgPoint(e){
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function fromPointer(e){
    var p = svgPoint(e);
    var ang = Math.atan2(p.x - H.x, H.y - p.y) * 180 / Math.PI;
    target = Math.max(0, Math.min(1, (ang - A0) / (A1 - A0)));
  }
  svg.addEventListener('pointerdown', function(e){
    dragging = true; svg.classList.add('dragging');
    try{ svg.setPointerCapture(e.pointerId); }catch(err){}
    fromPointer(e); e.preventDefault();
  });
  svg.addEventListener('pointermove', function(e){ if(dragging) fromPointer(e); });
  function end(){ dragging = false; svg.classList.remove('dragging'); }
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  range.addEventListener('input', function(){ target = range.value / 100; });
  range.addEventListener('pointerdown', function(){ rangeActive = true; });
  window.addEventListener('pointerup', function(){ rangeActive = false; });
  range.addEventListener('keydown', function(){ rangeActive = true; setTimeout(function(){ rangeActive = false; }, 300); });

  render();
  requestAnimationFrame(tick);
})();



/* ══════════════════════════
   Thela, Thaila, Thikana — interactive research page
══════════════════════════ */
(function ThelaPage(){
  var page = document.getElementById('page-thela');
  if(!page || !page.querySelector('.tt')) return;
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){
    var n = document.createElementNS(SVGNS, tag);
    for(var k in attrs) n.setAttribute(k, attrs[k]);
    if(parent) parent.appendChild(n);
    return n;
  }
  function once(target, fn, threshold){
    if(!target) return;
    if(!('IntersectionObserver' in window)){ fn(); return; }
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ fn(); io.disconnect(); } });
    }, { threshold: threshold || .4 });
    io.observe(target);
  }
  function scrollToEl(t){
    if(t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
  }

  /* ---- market plan ---- */
  var PLAN = {
    road:   ['C.G. Road', 'One of Ahmedabad’s busiest streets runs right alongside the market.'],
    food:   ['the western entrance', 'Flooded with smaller food stalls that come alive in the evening, which makes the market a hangout for every age group.'],
    north:  ['shops · north', 'Part of the ring of 49 small shops around the courtyard.'],
    east:   ['shops · east', 'Part of the ring of 49 small shops around the courtyard.'],
    south:  ['shops · south', 'Part of the ring of 49 small shops around the courtyard.'],
    court:  ['the courtyard', 'Used for parking. On busy days it fills up, and vendors rank the crowding as one of the market’s problems.'],
    temple: ['the temple', 'A tea stall near the temple has been running for about 50 years.']
  };
  var plan = document.getElementById('ttPlan'), note = document.getElementById('ttPlanNote');
  if(plan && note){
    var k1 = note.querySelector('.tt-plan-k'), t1 = note.querySelector('.tt-plan-t');
    plan.querySelectorAll('.tt-z').forEach(function(z){
      function act(){
        var d = PLAN[z.getAttribute('data-z')]; if(!d) return;
        plan.classList.add('has-active');
        plan.querySelectorAll('.tt-z').forEach(function(o){ o.classList.toggle('active', o === z); });
        k1.textContent = d[0]; t1.textContent = d[1];
      }
      z.addEventListener('mouseenter', act);
      z.addEventListener('click', act);
    });
  }

  /* ---- counters + age bar ---- */
  once(document.getElementById('ttStats'), function(){
    page.querySelectorAll('#ttStats b[data-to]').forEach(function(b){
      var to = +b.getAttribute('data-to'), pre = b.getAttribute('data-pre') || '', suf = b.getAttribute('data-suf') || '';
      var isYear = b.getAttribute('data-fmt') === 's';
      var from = isYear ? 1900 : 0, t0 = null, dur = 1100;
      function step(ts){
        if(t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        var v = Math.round(from + (to - from) * e);
        b.textContent = pre + (isYear ? v + 's' : v.toLocaleString('en-IN')) + suf;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });
  var age = page.querySelector('.tt-age');
  once(age, function(){ age.classList.add('on'); });

  /* ---- method index ---- */
  page.querySelectorAll('.tt-method').forEach(function(b){
    b.addEventListener('click', function(){ scrollToEl(document.getElementById(b.getAttribute('data-go'))); });
  });

  /* ---- interview themes fan ---- */
  var THEMES = [
    ['longevity & continuity', [['Bhupendra Shah', 'In the market since 1976; has run ‘Cheers’ since 1980.'], ['Neel, coconut vendor', 'Has been serving customers for about 50 years.'], ['Kuldeep Yadav', 'Has run a tea stall near the temple for around 50 years.']]],
    ['satisfaction', [['Vinodbhai', 'Has no complaints about how the market runs or how clean it is.'], ['Monika', 'Feels safe here as a woman, even late at night.'], ['Ansar', 'Likes the market as it is.']]],
    ['disappointment & concern', [['Krishna and Laxmanbhai', 'Point to unhygienic washrooms and poor facilities for women.'], ['Ravi Kumar, AMC sweeper', 'His wages don’t cover basic needs.'], ['Raju', 'Worries the market won’t survive against branded stores.']]],
    ['hope & optimism', [['Manushree', 'Pictures a renewed market in ten years, with better parking and new stores.'], ['Monika', 'Wants outdated shops revamped for today’s needs, like more grocery stores.']]],
    ['nostalgia', [['Monika', 'The market is the backdrop to her childhood memories.'], ['Manushree', 'Remembers it as a warm, safe place when she was young.']]],
    ['adaptation & resilience', [['Vinodbhai', 'His family keeps their toy business going despite the obstacles.'], ['Ansar, larry owner', 'Keeps his business running despite worrying about change.']]],
    ['declining footfall', [['Neel', 'Sees fewer visitors and blames growing competition.'], ['Raju', 'Has noticed business slowing down.']]]
  ];
  var fan = document.getElementById('ttFan'), voices = document.getElementById('ttVoices');
  if(fan && voices){
    var cx = 14, cy = 150, r0 = 58, r1 = 128, n = THEMES.length;
    var a0 = -80, a1 = 80, gap = 2.2;
    var pt = function(r, deg){ var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    var wedges = [];
    THEMES.forEach(function(th, i){
      var s = a0 + (a1 - a0) * i / n + gap / 2, e = a0 + (a1 - a0) * (i + 1) / n - gap / 2;
      var p1 = pt(r0, s), p2 = pt(r1, s), p3 = pt(r1, e), p4 = pt(r0, e);
      var d = 'M' + p1 + ' L' + p2 + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + p3 + ' L' + p4 + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + p1 + 'Z';
      var w = el('path', { d: d, class: 'tt-wedge', tabindex: '0', role: 'button', 'aria-label': th[0] }, fan);
      var mid = (s + e) / 2, lp = pt((r0 + r1) / 2, mid);
      var t = el('text', { x: lp[0].toFixed(1), y: (lp[1] + 4).toFixed(1), class: 'tt-wedge-n' }, fan);
      t.textContent = '0' + (i + 1);
      var lab = pt(r1 + 10, mid);
      var tl = el('text', { x: lab[0].toFixed(1), y: (lab[1] + 4).toFixed(1), 'class': 'tt-fan-l' }, fan);
      tl.textContent = th[0];
      var pick = function(){
        wedges.forEach(function(o, j){
          o.classList.toggle('active', j === i);
          var m = (a0 + (a1 - a0) * (j + .5) / n) * Math.PI / 180;
          o.style.transform = j === i ? 'translate(' + (Math.cos(m) * 7).toFixed(1) + 'px,' + (Math.sin(m) * 7).toFixed(1) + 'px)' : '';
        });
        voices.innerHTML = '';
        var h = document.createElement('p'); h.className = 'tt-k'; h.textContent = '0' + (i + 1) + ' of 07 \u00b7 ranked by how often it came up';
        var tt = document.createElement('p'); tt.className = 'tt-voices-t'; tt.textContent = th[0];
        voices.appendChild(h); voices.appendChild(tt);
        th[1].forEach(function(v, j){
          var p = document.createElement('p'); p.className = 'tt-voice'; p.style.animationDelay = (j * .08) + 's';
          var b = document.createElement('b'); b.textContent = v[0];
          p.appendChild(b); p.appendChild(document.createTextNode(v[1]));
          voices.appendChild(p);
        });
      };
      w.addEventListener('click', pick);
      w.addEventListener('mouseenter', pick);
      w.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); pick(); } });
      wedges.push(w);
      if(i === 0) pick();
    });
  }

  /* ---- stakeholder rings ---- */
  var RINGS = {
    'in': ['vendors & shop owners', 'street vendors', 'consumers', 'market association', 'police officials', 'AMC sanitation & maintenance staff'],
    'out': ['auto & cab drivers', 'local residents', 'nearby businesses', 'government & AMC', 'waste collectors', 'online stores & malls', 'bus stop', 'delivery agents', 'event organisers', 'police', 'temple']
  };
  var ringList = document.getElementById('ttRingList');
  var showRing = function(k){
    page.querySelectorAll('.tt-ring').forEach(function(r){ r.classList.toggle('active', r.getAttribute('data-ring') === k); r.setAttribute('aria-pressed',String(r.getAttribute('data-ring') === k)); });
    ringList.innerHTML = '';
    RINGS[k].forEach(function(s, i){
      var c = document.createElement('span'); c.className = 'tt-chip'; c.textContent = s; c.style.animationDelay = (i * .035) + 's';
      ringList.appendChild(c);
    });
  };
  if(ringList){
    page.querySelectorAll('.tt-ring').forEach(function(r){
      r.addEventListener('click', function(ev){ ev.stopPropagation(); showRing(r.getAttribute('data-ring')); });

    });
    showRing('out');
  }

  /* ---- power x interest matrix ---- */
  var QMEAN = {
    satisfied: 'High power, low interest: they can decide things like fines and renovations, but rarely deal with the market day to day.',
    manage: 'High power, high interest: they shape the market and care how it changes.',
    monitor: 'Low power, low interest in the wider decisions, even though many of them are in the market every day.',
    informed: 'Low power, high interest: they’re affected by what happens here but have little say.'
  };
  var cap = document.getElementById('ttMatrixCap');
  page.querySelectorAll('.power-point').forEach(function(point){
    function activate(){
      page.querySelectorAll('.power-point,.power-quadrant').forEach(function(el){el.classList.remove('active');});
      point.classList.add('active');
      var key=point.getAttribute('data-q');
      var quadrant=page.querySelector('.power-quadrant[data-q="'+key+'"]');
      quadrant.classList.add('active');
      cap.textContent=point.textContent.trim()+' — '+quadrant.textContent.trim()+'. '+QMEAN[key];
    }
    point.addEventListener('mouseenter',activate);
    point.addEventListener('focus',activate);
    point.addEventListener('click',activate);
  });

  page.querySelectorAll('.tt-persona').forEach(function(persona){
    persona.addEventListener('click',function(){
      var names={'local residents':'Residential community','street vendors':'Street vendors','consumers':'Customer','delivery agents':'Delivery agents','auto & cab drivers':'Auto driver'};
      var target=names[persona.getAttribute('data-st')];
      var point=Array.from(page.querySelectorAll('.power-point')).find(function(p){return p.textContent.trim()===target;});
      if(point){point.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});point.focus({preventScroll:true});point.click();}
    });
  });

  /* ---- a day in the life dial ---- */
  var DAY = [
    [6, 8, 'home', '6am – 8am', 'She wakes up, fetches water from the local tank for the house, then starts the household chores.'],
    [8, 12, 'home', '8am – 12pm', 'She wakes her kids, gets them ready for school and finishes the rest of the chores.'],
    [12, 13, 'home', '12pm – 1pm', 'She makes lunch for the family with her sister.'],
    [13, 14, 'src', '1pm – 2pm', 'She checks her stock. If it’s low, she goes with her husband to Kalupur market to buy toys and materials.'],
    [14, 15, 'home', '2pm – 3pm', 'Back home: a break, lunch, and the last of the chores.'],
    [15, 16, 'rest', '3pm – 4pm', 'She sleeps for about an hour to recharge before the market.'],
    [16, 17, 'walk', '4pm – 5pm', 'She packs the stall items and walks to the stall area, ready to set up at 5.'],
    [17, 20, 'stall', '5pm – 8pm', 'She sets up the roadside stall with her family, cleans the area around it to avoid being fined, and keeps the pavement clear for people walking by.'],
    [20, 24, 'stall', '8pm – 12am', 'They ask visitors to buy them dinner, or go home on an empty stomach after packing up.']
  ];
  var KIND = { home: 'home and family', src: 'sourcing stock', rest: 'rest', walk: 'getting to the stall', stall: 'at the stall' };
  var dial = document.getElementById('ttDial');
  if(dial){
    var C = 150, R0 = 82, R1 = 128;
    var hp = function(h, r){ var a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
    var arc = function(h0, h1, cls){
      var p1 = hp(h0, R0), p2 = hp(h0, R1), p3 = hp(h1, R1), p4 = hp(h1, R0), big = (h1 - h0) > 12 ? 1 : 0;
      return el('path', { d: 'M' + p1 + ' L' + p2 + ' A' + R1 + ' ' + R1 + ' 0 ' + big + ' 1 ' + p3 + ' L' + p4 + ' A' + R0 + ' ' + R0 + ' 0 ' + big + ' 0 ' + p1 + 'Z', 'class': cls }, dial);
    };
    arc(0, 6, 'tt-seg k-night');
    var hourNow = 6.5, hourShown = 6.5, lastIdx = -2;
    var setHour = function(h){ hourNow = ((h % 24) + 24) % 24; };
    var segs = DAY.map(function(d){
      var s = arc(d[0], d[1], 'tt-seg k-' + d[2]);
      s.setAttribute('tabindex','0');s.setAttribute('role','button');s.setAttribute('aria-label',d[3]+' — '+KIND[d[2]]);
      s.addEventListener('click', function(){ setHour(d[0] + .5); });
      s.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();setHour(d[0]+.5);}});
      return s;
    });
    [0, 6, 12, 18].forEach(function(h){
      var p = hp(h, R1 + 14), t = el('text', { x: p[0].toFixed(1), y: (p[1] + 4).toFixed(1), 'class': 'tt-tick' }, dial);
      t.textContent = h === 0 ? '12am' : h === 12 ? '12pm' : (h % 12) + (h < 12 ? 'am' : 'pm');
    });
    var hand = el('line', { x1: C, y1: C, x2: C, y2: C - R0 + 8, 'class': 'tt-hand' }, dial);
    el('circle', { cx: C, cy: C, r: 5, 'class': 'tt-hub' }, dial);
    var tEl = document.getElementById('ttDayTime'), kEl = document.getElementById('ttDayKind'), xEl = document.getElementById('ttDayText');
    var idxFor = function(h){ for(var i = 0; i < DAY.length; i++){ if(h >= DAY[i][0] && h < DAY[i][1]) return i; } return -1; };
    var fmt = function(h){ var hh = Math.floor(h), mm = Math.floor((h - hh) * 4) * 15, ap = hh < 12 ? 'am' : 'pm', h12 = hh % 12 === 0 ? 12 : hh % 12; return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap; };
    var frame = function(){
      var diff = hourNow - hourShown;
      if(diff > 12) diff -= 24;
      if(diff < -12) diff += 24;
      hourShown += diff * (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : .18);
      if(Math.abs(diff) < .002) hourShown = hourNow;
      hourShown = (hourShown + 24) % 24;
      var p = hp(hourShown, R0 - 8);
      hand.setAttribute('x2', p[0].toFixed(1)); hand.setAttribute('y2', p[1].toFixed(1));
      var i = idxFor(hourNow);
      tEl.textContent = fmt(hourNow);
      if(i !== lastIdx){
        lastIdx = i;
        segs.forEach(function(s, j){ s.classList.toggle('dim', i >= 0 && j !== i); });
        if(i < 0){ kEl.textContent = 'night'; xEl.textContent = 'The few hours between packing up and starting again.'; }
        else { kEl.textContent = KIND[DAY[i][2]] + ' · ' + DAY[i][3]; xEl.textContent = DAY[i][4]; }
      }
      requestAnimationFrame(frame);
    };
    var dragging = false;
    var fromEvent = function(ev){
      var pt2 = dial.createSVGPoint(); pt2.x = ev.clientX; pt2.y = ev.clientY;
      var q = pt2.matrixTransform(dial.getScreenCTM().inverse());
      var a = Math.atan2(q.y - C, q.x - C) + Math.PI / 2; if(a < 0) a += 2 * Math.PI;
      setHour(a / (2 * Math.PI) * 24);
    };
    dial.addEventListener('pointerdown', function(ev){ dragging = true; try{ dial.setPointerCapture(ev.pointerId); }catch(err){} fromEvent(ev); });
    dial.addEventListener('pointermove', function(ev){ if(dragging) fromEvent(ev); });
    dial.addEventListener('pointerup', function(){ dragging = false; });
    dial.addEventListener('pointercancel', function(){ dragging = false; });
    requestAnimationFrame(frame);
  }

  /* ---- shadowing evening ---- */
  var EVE = [
    ['Before arrival', ['They decide when to come based on the previous day’s earnings.', 'Good sales means arriving early; if not, they wait until evening.', 'Sometimes they grab tea before heading to the stall.']],
    ['Setup', ['They arrive around 4:30pm and set up the belts quickly. They’ve clearly done this hundreds of times.', 'The stall is basic but organised.', 'A quick chat with the vendors nearby while setting up.']],
    ['Selling time', ['Customers expect to bargain; they handle it calmly and often lower the price.', 'Friendly with regulars: a nod or a wave to familiar faces.', 'When a UPI payment or phone acts up, nearby vendors help without hesitation.', 'Tea and snacks are sometimes shared among vendors.']],
    ['After sunset', ['They stay after dark, hoping for last-minute customers.', 'They don’t pack up early, because every sale matters.', 'They check on each other’s sales with nearby vendors.']],
    ['Pack-up and exit', ['Packing up takes minutes; each of them knows exactly what to do.', 'A few quick words with the other vendors before leaving.']]
  ];
  var eve = document.getElementById('ttEve'), eveNote = document.getElementById('ttEveNote');
  if(eve){
    var dots = eve.querySelectorAll('.tt-eve-stop');
    var showEve = function(i){
      eve.setAttribute('data-i', i);
      dots.forEach(function(d, j){ d.classList.toggle('active', j === i); });
      eveNote.innerHTML = '';
      var h = document.createElement('h4'); h.textContent = EVE[i][0]; eveNote.appendChild(h);
      var ul = document.createElement('ul');
      EVE[i][1].forEach(function(t, j){ var li = document.createElement('li'); li.textContent = t; li.style.animationDelay = (j * .07) + 's'; ul.appendChild(li); });
      eveNote.appendChild(ul);
    };
    dots.forEach(function(d, j){ d.addEventListener('click', function(){ showEve(j); }); });
    showEve(0);
  }

  /* ---- card sorting ---- */
  var PROBS = ['unsanitary washrooms', 'waste management', 'unorganised vendors', 'overcrowding', 'parking'];
  var RANKS = [ // per vendor: rank given to each problem (PROBS order)
    [1, 3, 2, 4, 5],  // Suresh
    [1, 2, 3, 4, 5],  // Manish
    [1, 4, 2, 5, 3],  // Mahesh
    [1, 2, 5, 3, 4],  // Ravi
    [1, 4, 5, 3, 2]   // Reema
  ];
  var AVG = PROBS.map(function(_, p){ var s = 0; RANKS.forEach(function(r){ s += r[p]; }); return s / RANKS.length; });
  var rowsWrap = document.getElementById('ttSortRows');
  if(rowsWrap){
    var ROWH = 56;
    rowsWrap.style.height = (ROWH * PROBS.length) + 'px';
    var rows = PROBS.map(function(name, p){
      var row = document.createElement('div'); row.className = 'tt-row';
      row.innerHTML = '<span class="tt-row-rank"></span><span class="tt-row-name"></span><canvas></canvas><span class="tt-row-val"></span>';
      row.querySelector('.tt-row-name').textContent = name;
      rowsWrap.appendChild(row);
      return { el: row, cv: row.querySelector('canvas'), rank: row.querySelector('.tt-row-rank'), val: row.querySelector('.tt-row-val'), amp: 0, target: 0, seed: p * 7.3 };
    });
    var apply = function(v){
      var ranks = v === 'avg' ? AVG : RANKS[v];
      var order = PROBS.map(function(_, p){ return p; }).sort(function(a, b){ return ranks[a] - ranks[b] || a - b; });
      order.forEach(function(p, pos){
        var r = rows[p];
        r.el.style.top = (pos * ROWH) + 'px';
        r.rank.textContent = pos + 1;
        r.val.textContent = v === 'avg' ? 'avg ' + ranks[p].toFixed(1) : '#' + ranks[p];
        r.target = (6 - ranks[p]) / 5;
      });
    };
    page.querySelectorAll('#ttVendors button').forEach(function(b){
      b.addEventListener('click', function(){
        page.querySelectorAll('#ttVendors button').forEach(function(o){ o.classList.toggle('active', o === b); });
        apply(b.getAttribute('data-v'));
      });
    });
    apply('avg');

    var custs = Array.prototype.map.call(page.querySelectorAll('.tt-cust-seg'), function(seg, i){
      return { cv: seg.querySelector('canvas'), amp: [.18, .5, 1][i], seed: 40 + i * 13 };
    });
    var running = false, t = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var drawWave = function(cv, amp, seed, color){
      var w = cv.clientWidth, h = cv.clientHeight; if(!w || !h) return;
      var dpr = window.devicePixelRatio || 1;
      if(cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath();
      var mid = h / 2;
      for(var x = 0; x <= w; x += 3){
        var nz = Math.sin(x * .19 + t * 2.1 + seed) * .55 + Math.sin(x * .053 - t * 1.3 + seed * 2) * .3 + Math.sin(x * .41 + t * 3.7) * .15;
        var y = mid + nz * amp * (mid - 2);
        if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    var loop = function(){
      if(!running) return;
      if(page.classList.contains('active')){
        if(!reduce) t += .016;
        var col = getComputedStyle(page).getPropertyValue('--ink').trim() || '#222';
        rows.forEach(function(r){ r.amp += (r.target - r.amp) * .08; drawWave(r.cv, r.amp, r.seed, r.target > .9 ? '#7A111F' : col); });
        custs.forEach(function(c){ drawWave(c.cv, c.amp * .9, c.seed, 'rgba(255,255,255,.9)'); });
      }
      requestAnimationFrame(loop);
    };
    if('IntersectionObserver' in window){
      var io2 = new IntersectionObserver(function(es){
        var vis = es.some(function(e){ return e.isIntersecting; });
        if(vis && !running){ running = true; requestAnimationFrame(loop); }
        else if(!vis){ running = false; }
      }, { threshold: 0 });
      io2.observe(document.getElementById('ttSort'));
    } else { running = true; requestAnimationFrame(loop); }
  }

  /* ---- insights: lift the note ---- */
  page.querySelectorAll('.tt-ins').forEach(function(b){
    b.addEventListener('click', function(){ b.classList.toggle('open'); });
  });

  /* ---- zine palette: click a swatch to copy the hex ---- */
  page.querySelectorAll('.tt-sw').forEach(function(sw){
    sw.addEventListener('click', function(){
      var hex = sw.getAttribute('data-hex'), span = sw.querySelector('span');
      if(!navigator.clipboard){window.Portfolio.toast(hex);return;}
      navigator.clipboard.writeText(hex).then(function(){sw.classList.add('copied');span.textContent='copied';setTimeout(function(){sw.classList.remove('copied');span.textContent=hex;},1200);}).catch(function(){window.Portfolio.toast('Color: '+hex);});
    });
  });
})();

