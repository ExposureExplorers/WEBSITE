import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './Frame79.module.css';

gsap.registerPlugin(ScrollTrigger);

const Frame79 = () => {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Collect candidate text elements: divs and paragraphs only
		const allCandidates = Array.from(container.querySelectorAll('div, p'));

		// Filter out non-textual or decorative elements
		const textElements = allCandidates.filter((el) => {
			const tag = el.tagName;
			if (!(tag === 'DIV' || tag === 'P')) return false;
			const className = (el.className || '').toString();
			// Exclude images (handled as <img>) and decorative lines/frames/instagram icons
			if (
				className.includes('frameChild') ||
				className.includes('lineDiv') ||
				className.includes('frameInner') ||
				className.includes('instagram') ||
				className.includes('meetTheTeamContainer') ||
				className.includes('meetTheTeam')
			) {
				return false;
			}
			// Avoid animating empty wrappers
			return (el.textContent || '').trim().length > 0;
		});

		// Initial state for text
		textElements.forEach((el) => {
			gsap.set(el, { opacity: 0, y: 32 });
		});

		// Animate each text block on scroll like mobile: subtle, slower fade-up tied to scroll
		const textTriggers = textElements.map((el) => {
			return gsap.to(el, {
				opacity: 1,
				y: 0,
				ease: 'power2.out',
				duration: 1.2,
				scrollTrigger: {
					trigger: el,
					start: 'top 90%',
					end: 'bottom 60%',
					scrub: 1.2,
					fastScrollEnd: true,
					markers: false,
					once: false
				}
			});
		});

		// Animate line elements (grow from left) similar to /contact
		const lineSelectors = [
			`.${styles.lineDiv}`,
			`.${styles.frameInner}`,
			`.${styles.rectangleParentFrameChild}`,
			`.${styles.frameChild2}`,
			`.${styles.frameChild4}`,
			`.${styles.frameChild6}`,
			`.${styles.frameChild8}`,
			`.${styles.frameChild9}`,
			`.${styles.frameChild10}`
		].join(',');

		const lineElements = Array.from(container.querySelectorAll(lineSelectors));
		lineElements.forEach((el) => {
			gsap.set(el, { transformOrigin: 'left center', scaleX: 0 });
		});

		const lineTriggers = lineElements.map((el) =>
			gsap.to(el, {
				scaleX: 1,
				ease: 'power2.out',
				duration: 0.9,
				scrollTrigger: {
					trigger: el,
					start: 'top 92%',
					end: 'top 70%',
					scrub: 1,
					markers: false
				}
			})
		);

	// Animate instagram svg icons (img elements) and buttons with gentle pop-in
	const instaSelectors = [
		`.${styles.instagramSvgrepoCom11}`,
		`.${styles.instagramSvgrepoCom16}`,
		`.${styles.instagramSvgrepoCom113}`,
		`.${styles.instagramSvgrepoCom110}`,
		`.${styles.instagramSvgrepoCom111}`,
		`.${styles.instagramSvgrepoCom112}`,
		`.${styles.instagramSvgrepoCom162}`,
		`.${styles.instagramButton}`,
		`.${styles.instagramButton2}`,
		`.${styles.instagramButton14}`
	].join(',');

		const instaElements = Array.from(container.querySelectorAll(instaSelectors));
		instaElements.forEach((el) => {
			gsap.set(el, { opacity: 0, y: 16, scale: 0.88, transformOrigin: 'center center' });
		});

		const instaTriggers = instaElements.map((el) => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: el,
					start: 'top 90%',
					end: 'top 65%',
					scrub: 1,
					markers: false
				}
			});

			// Segment 1: fade/raise and pop to 1.06 with slight rotate
			tl.to(el, { opacity: 1, y: 0, scale: 1.06, rotate: 2, duration: 0.6, ease: 'power2.out' });
			// Segment 2: settle to scale 1 and rotate 0
			tl.to(el, { scale: 1, rotate: 0, duration: 0.4, ease: 'power2.out' });

			return tl;
		});

		// Animate the description lines inside ourDedicatedTeamContainer (appearance-based, staggered fade-up)
		const aboutContainer = container.querySelector(`.${styles.ourDedicatedTeamContainer}`);
		let aboutTrigger = null;
		if (aboutContainer) {
			const paras = Array.from(aboutContainer.querySelectorAll('p'));
			paras.forEach((p) => gsap.set(p, { opacity: 0, y: 28 }));
			aboutTrigger = gsap.to(paras, {
				opacity: 1,
				y: 0,
				duration: 1.4,
				delay: 0.5,
				ease: 'power3.out',
				stagger: 0.16,
				scrollTrigger: {
					trigger: aboutContainer,
					start: 'top 88%',
					end: 'bottom 70%',
					once: true,
					scrub: false,
					markers: false
				}
			});
		}

		// Animate the title: bind "Team" to the same animation as "Meet the"
		let titleTrigger = null;
		const titleSpan = container.querySelector(`.${styles.meetTheTeamContainer} span:not(.${styles.team})`);
		const teamEl = container.querySelector(`.${styles.meetTheTeamContainer} i.${styles.team}`);
		let underlineEl = null;
		if (teamEl) {
			// Prepare underline under Team
			teamEl.style.position = 'relative';
			teamEl.style.display = 'inline-block';
			underlineEl = document.createElement('span');
			underlineEl.setAttribute('aria-hidden', 'true');
			Object.assign(underlineEl.style, {
				position: 'absolute',
				left: '0',
				right: 'auto',
				bottom: '-4px',
				height: '2px',
				background: 'currentColor',
				opacity: '0.95',
				zIndex: '1',
				transformOrigin: 'left center',
				transform: 'scaleX(0)',
				width: '100%',
				pointerEvents: 'none'
			});
			// Ensure underline is appended once
			if (!teamEl.querySelector('span[aria-hidden="true"]')) {
				teamEl.appendChild(underlineEl);
			} else {
				underlineEl = teamEl.querySelector('span[aria-hidden="true"]');
			}
		}

		if (titleSpan) {
			// Ensure both pieces share identical layout characteristics
			titleSpan.style.display = 'inline-block';
			titleSpan.style.position = 'relative';
			// Normalize trailing whitespace so spacing is controlled explicitly
			titleSpan.textContent = (titleSpan.textContent || '').replace(/\s+$/, '');
			if (teamEl) {
				teamEl.style.display = 'inline-block';
				teamEl.style.position = 'relative';
				teamEl.style.marginLeft = '0.25em';
			}
			const together = teamEl ? [titleSpan, teamEl] : [titleSpan];
			gsap.set(together, { opacity: 0, y: 24, letterSpacing: '0.02em', filter: 'blur(2px)', willChange: 'transform' });
			titleTrigger = gsap.timeline({
				scrollTrigger: {
					trigger: titleSpan,
					start: 'top 92%',
					end: 'top 70%',
					once: true,
					scrub: false,
					markers: false
				}
			});
			// Delay then reveal both
			titleTrigger.to({}, { duration: 0.4 });
			titleTrigger.to(together, {
				y: 0,
				opacity: 1,
				letterSpacing: '0em',
				filter: 'blur(0px)',
				ease: 'power4.out',
				duration: 1.2
			});
			// Underline after text
			if (underlineEl) {
				titleTrigger.to(underlineEl, { scaleX: 1, ease: 'power3.out', duration: 1.5 });
			}
		}

		// Removed separate typing animation; Team now animates with title timeline above

		// No animation for the title box per request

		return () => {
			textTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			lineTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			instaTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			if (aboutTrigger && aboutTrigger.scrollTrigger) aboutTrigger.scrollTrigger.kill();
			if (titleTrigger && titleTrigger.scrollTrigger) titleTrigger.scrollTrigger.kill();
		};
	}, []);

	return (
			<div ref={containerRef} className={styles.rectangleParent}>
      			<img className={styles.frameChild} src="/assets/images/members/IMG_935211 [1].webp" alt="" />
      			<div className={styles.meetTheTeamContainer}>
        				<p className={styles.meetTheTeam}>
          					<span>{`Meet the `}</span>
								<i className={styles.team}>Team</i>
          					<span className={styles.team}>{` `}</span>
        				</p>
      			</div>
      			<div className={styles.ourDedicatedTeamContainer}>
        				<p className={styles.meetTheTeam}>Our dedicated team of photographers,</p>
        				<p className={styles.meetTheTeam}>cinematographers and editors</p>
      			</div>
      			<img className={styles.frameItem} src="/assets/images/members/IMG_20241227_204306.jpg" alt="" />
      			<div className={styles.dhruvalVashi}>Dhruval Vashi</div>
      			<div className={styles.frameInner} />
      			<div className={styles.photographer}>{`Photographer `}</div>
      			<div className={styles.vicePresident}>Ball Knower</div>
      			<img className={styles.instagramSvgrepoCom11} src="/assets/icons/smile-svgrepo-com.svg" alt="" />
      			<div className={styles.jonathanPaul}>Jonathan Paul</div>
      			<div className={styles.lineDiv} />
      			<div className={styles.rectangleParentPhotographer}>{`Photographer `}</div>
      			<div className={styles.headOfPhotography}>Advisor</div>
      			<img className={styles.instagramSvgrepoCom16} src="/assets/icons/instagram-svgrepo-com (1).svg" alt="" />
      			<img className={styles.rectangleIcon} src="/assets/images/members/IMG_8107[1] (1).webp" alt="" />
      			<div className={styles.ronakBarwar}>Ronak Barwar</div>
      			<a href="https://pin.it/2UVHJTQhA" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton2}`}>
				<img src="/assets/icons/icons8-pinterest.svg" alt="Pinterest" />
			</a>
      			<div className={styles.rectangleParentFrameChild} />
      			<div className={styles.photographer2}>{`Photographer `}</div>
      			<div className={styles.president}>Advisor</div>
      			<div className={styles.adityaMadkikar}>Aditya Madkaikar</div>
      			<div className={styles.frameChild2} />
      			<div className={styles.cinematographer}>Cinematographer</div>
      			<div className={styles.headOfVideography}>Head of Cinematography</div>
      			<img className={styles.frameChild3} src="/assets/images/members/WhatsApp Image 2025-09-12 at 10.52.59_3d59ecb0.jpg" alt="" />
      			<div className={styles.yashodhanBorkar}>Yashodhan Borkar</div>
      			<a href="https://www.instagram.com/yasho_pb?igsh=MTNmdjB2Y3YxaTZrcA==" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton14}`}>
				<img src="/assets/icons/instagram-svgrepo-com (1).svg" alt="Instagram" />
			</a>
      			<a href="https://www.instagram.com/adimadkaikar_" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton5}`}>
				<img src="/assets/icons/instagram-svgrepo-com (1).svg" alt="Instagram" />
			</a>
      			<div className={styles.frameChild4} />
      			<div className={styles.photographer3}>{`Photographer `}</div>
      			<div className={styles.advisor}>Advisor</div>
      			<img className={styles.frameChild5} src="/assets/images/members/WhatsApp Image 2025-09-12 at 07.28.01_5d08ba86.jpg" alt="" />
			<div className={styles.piyushSingh}>Himesh Solanki</div>
			<a href="https://www.linkedin.com/in/himesh-solanki-a03088323?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton6}`}>
				<img src="/assets/icons/brand-linkedin-fill (1).svg" alt="LinkedIn" />
			</a>
			<div className={styles.frameChild6} />
			<div className={styles.rectangleParentCinematographer}>Photographer</div>
			<div className={styles.member}>President</div>
			<img className={styles.frameChild7} src="/assets/images/members/ABC_6513.webp" alt="" />
			<div className={styles.himeshSolanki}>Piyush Singh</div>
			<a href="https://www.instagram.com/aki1_pr1yan_?igsh=MW1mMWZtZWVzZXN6ag==" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton9}`}>
				<img src="/assets/icons/instagram-svgrepo-com (1).svg" alt="LinkedIn" />
			</a>
			<div className={styles.photographer4}>{`Cinematographer `}</div>
			<div className={styles.rectangleParentMember}>Head of Photography</div>
			<div className={styles.akilPriyan}>Akil Priyan</div>
			<a href="https://www.linkedin.com/in/editwithpiyush" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton7}`}>
				<img src="/assets/icons/brand-linkedin-fill (1).svg" alt="Instagram" />
			</a>
      			<div className={styles.frameChild8} />
      			<div className={styles.frameChild9} />
      			<div className={styles.photographer5}>{`Photographer `}</div>
      			<div className={styles.member2}>Member</div>
      			<div className={styles.pranavLajeesh}>Pranav Lajeesh</div>
      			<a href="https://www.instagram.com/_pranav.l?igsh=MTVtazV2Y2Y2eGJjOQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton8}`}>
				<img src="/assets/icons/instagram-svgrepo-com (1).svg" alt="Instagram" />
			</a>
      			<div className={styles.frameChild10} />
      			<div className={styles.editor}>Editor</div>
      			<div className={styles.member3}>Head of VFX</div>
      			<img className={styles.frameChild11} src="/assets/images/members/IMG_255411 [1].JPG" alt="" />
      			<img className={styles.frameChild12} src="/assets/images/members/WhatsApp Image 2025-09-12 at 13.34.52_4f31c18c.jpg" alt="" />
      			<img className={styles.frameChild13} src="/assets/images/members/ABC_6075.webp" alt="" />
    		</div>);
};

export default Frame79;
