import React, { useEffect, useRef } from 'react';
import useRouteTransitionReady from '../hooks/useRouteTransitionReady';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './the-team-mobile.module.css';
import SimpleNav from './SimpleNav';

gsap.registerPlugin(ScrollTrigger);

const TheTeamMobile = () => {
	const containerRef = useRef(null);
  const isRouteReady = useRouteTransitionReady();

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Text fade-up (exclude decorative/empty wrappers)
		const allCandidates = Array.from(container.querySelectorAll('div, p'));
		const textElements = allCandidates.filter((el) => {
			const tag = el.tagName;
			if (!(tag === 'DIV' || tag === 'P')) return false;
			const className = (el.className || '').toString();
			if (
				className.includes('containerIcon') ||
				className.includes('appContainerIcon') ||
				className.includes('container4') ||
				className.includes('container8') ||
				className.includes('container9')
			) {
				return false;
			}
			// Exclude container 9 text; we'll animate it separately so it can fire earlier
			if (el.closest && el.closest(`.${styles.teammember8}`)) return false;
			return (el.textContent || '').trim().length > 0;
		});

	textElements.forEach((el) => gsap.set(el, { opacity: 0, y: 32 }));
	const textTriggers = textElements.map((el) =>
		gsap.to(el, {
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
		})
	);

		// Line grow-in
		const lineSelectors = [
			`.${styles.container4}`,
			`.${styles.container8}`,
			`.${styles.container9}`
		].join(',');
		const lineElements = Array.from(container.querySelectorAll(lineSelectors));
	lineElements.forEach((el) => gsap.set(el, { transformOrigin: 'left center', scaleX: 0 }));
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

	// Instagram icon pop-in (including buttons)
	const instaSelectors = [
		`.${styles.containerIcon}`,
		`.${styles.containerIcon2}`,
		`.${styles.containerIcon6}`,
		`.${styles.containerIcon9}`,
		`.${styles.containerIcon11}`,
		`.${styles.containerIcon13}`,
		`.${styles.containerIcon15}`,
		`.${styles.instagramButton}`,
		`.${styles.instagramButton2}`,
		`.${styles.instagramButton4}`
	].join(',');
		const instaElements = Array.from(container.querySelectorAll(instaSelectors));
	instaElements.forEach((el) => gsap.set(el, { opacity: 0, y: 16, scale: 0.88, transformOrigin: 'center center' }));
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
		tl.to(el, { opacity: 1, y: 0, scale: 1.06, rotate: 2, duration: 0.6, ease: 'power2.out' });
		tl.to(el, { scale: 1, rotate: 0, duration: 0.4, ease: 'power2.out' });
		return tl;
	});

		// About paragraphs fade-up once
		const aboutContainer = container.querySelector(`.${styles.container2}`);
		let aboutTrigger = null;
		if (aboutContainer) {
			const paras = Array.from(aboutContainer.querySelectorAll(`.${styles.paragraph}`));
			paras.forEach((p) => gsap.set(p, { opacity: 0, y: 28 }));
			aboutTrigger = gsap.to(paras, {
				opacity: 1,
				y: 0,
				duration: 1.2,
				delay: 0.3,
				ease: 'power3.out',
				stagger: 0.14,
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

		// Title reveal for Meet the + Team with underline on Team
		let titleTrigger = null;
		const titleSpan = container.querySelector(`.${styles.text} .${styles.meetThe}`);
		const teamEl = container.querySelector(`.${styles.appText} .${styles.meetThe}`);
		let underlineEl = null;
		if (teamEl) {
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
			if (!teamEl.querySelector('span[aria-hidden="true"]')) {
				teamEl.appendChild(underlineEl);
			} else {
				underlineEl = teamEl.querySelector('span[aria-hidden="true"]');
			}
		}

		if (titleSpan) {
			titleSpan.style.display = 'inline-block';
			titleSpan.style.position = 'relative';
			if (teamEl) {
				teamEl.style.display = 'inline-block';
				teamEl.style.position = 'relative';
				teamEl.style.marginLeft = '0.05em';
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
			titleTrigger.to({}, { duration: 0.4 });
			titleTrigger.to(together, { y: 0, opacity: 1, letterSpacing: '0em', filter: 'blur(0px)', ease: 'power4.out', duration: 1.2 });
			if (underlineEl) {
				titleTrigger.to(underlineEl, { scaleX: 1, ease: 'power3.out', duration: 1.5 });
			}
		}

		// Container 9 (Himesh) text: fire earlier without needing extra scroll space
		const himeshTexts = [
			container.querySelector(`.${styles.teammember8} .${styles.paragraph2}`),
			container.querySelector(`.${styles.teammember8} .${styles.paragraph3}`),
			container.querySelector(`.${styles.teammember8} .${styles.paragraph4}`)
		].filter(Boolean);
		himeshTexts.forEach((el) => gsap.set(el, { opacity: 0, y: 24 }));
		const himeshTriggers = himeshTexts.map((el) =>
			gsap.to(el, {
				opacity: 1,
				y: 0,
				duration: 1.0,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: el,
					start: 'top 85%', // later trigger
					end: 'top 85%',
					scrub: false,
					once: true,
					markers: false
				}
			})
		);

		return () => {
			textTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			lineTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			instaTriggers.forEach((anim) => anim && anim.scrollTrigger && anim.scrollTrigger.kill());
			if (aboutTrigger && aboutTrigger.scrollTrigger) aboutTrigger.scrollTrigger.kill();
			if (titleTrigger && titleTrigger.scrollTrigger) titleTrigger.scrollTrigger.kill();
			himeshTriggers.forEach((tl) => tl && tl.scrollTrigger && tl.scrollTrigger.kill());
		};
	}, []);

	return (
		<>
			<SimpleNav />
			<div ref={containerRef} className={styles.app} style={{ visibility: isRouteReady ? 'visible' : 'hidden' }}>
			<div className={styles.container}>
				<div className={styles.appContainer}>
					<div className={styles.text}>
						<div className={styles.meetThe}>Meet the</div>
					</div>
					<div className={styles.appText}>
						<i className={styles.meetThe}>Team</i>
					</div>
				</div>
				<div className={styles.container2}>
					<div className={styles.paragraph}>
						<div className={styles.ourDedicatedTeam}>Our dedicated team of photographers,</div>
					</div>
					<div className={styles.paragraph}>
						<div className={styles.ourDedicatedTeam}>cinematographers and editors</div>
					</div>
				</div>
			</div>
			<div className={styles.container3} />
			<img className={styles.bombSvgrepoCom2Icon} alt="" />
			<div className={styles.teammember}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Dhruval Vashi</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Photographer</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Ball Knower</div>
				</div>
				<img className={styles.containerIcon} alt="" src="/assets/icons/smile-svgrepo-com.svg" />
				<img className={`${styles.appContainerIcon} ${styles.appContainerIconShiftLeft}`} alt="" src="/assets/images/members/IMG_20241227_204306.jpg" />
			</div>
		<div className={styles.appTeammember}>
			<div className={styles.paragraph2}>
				<div className={styles.ourDedicatedTeam}>Ronak Barwar</div>
			</div>
			<div className={styles.container4} />
			<div className={styles.paragraph3}>
				<div className={styles.ourDedicatedTeam}>Photographer</div>
			</div>
			<div className={styles.paragraph4}>
				<div className={styles.ourDedicatedTeam}>Advisor
				</div>
			</div>
			<a href="https://pin.it/2UVHJTQhA" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton2}`}>
				<img alt="Pinterest" src="/assets/icons/icons8-pinterest.svg" />
			</a>
			<img className={styles.appContainerIcon} alt="" src="/assets/images/members/IMG_8107[1] (1).webp" />
		</div>
			<div className={styles.teammember2}>
				<div className={styles.paragraph2}>
					<div className={styles.adityaMadkikar}>Aditya Madkikar</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Cinematographer</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Head of Videography</div>
				</div>
				<a href="https://www.instagram.com/adimadkaikar_" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton4}`}>
					<img alt="Instagram" src="/assets/icons/instagram-svgrepo-com (1).svg" />
				</a>
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/WhatsApp Image 2025-09-12 at 10.52.59_3d59ecb0.jpg" />
			</div>
			<div className={styles.teammember3}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Jonathan Paul</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Photographer</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Member</div>
				</div>
				<img className={styles.containerIcon6} alt="" src="/assets/icons/instagram-svgrepo-com (1).svg" />
				<img className={`${styles.appContainerIcon} ${styles.appContainerIconShiftUp}`} alt="" src="/assets/images/members/IMG_935211 [1].webp" />
			</div>
			<div className={styles.teammember4}>
				<div className={styles.paragraph14}>
					<div className={styles.yashodhanBorkar}>Yash Borkar</div>
				</div>
				<div className={styles.container8} />
				<div className={styles.paragraph15}>
					<div className={styles.ourDedicatedTeam}>Photographer</div>
				</div>
				<div className={styles.paragraph16}>
					<div className={styles.ourDedicatedTeam}>Advisor</div>
				</div>
				<div className={styles.container9} />
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/WhatsApp Image 2025-09-12 at 07.28.01_5d08ba86.jpg" />
				<a href="https://www.instagram.com/yasho_pb?igsh=MTNmdjB2Y3YxaTZrcA==" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton5}`}>
					<img alt="Instagram" src="/assets/icons/instagram-svgrepo-com (1).svg" />
				</a>
			</div>
			<div className={styles.teammember5}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Himesh Solanki</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Photographer</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>President</div>
				</div>
			<a href="https://www.linkedin.com/in/himesh-solanki-a03088323?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton6}`}>
				<img alt="LinkedIn" src="/assets/icons/brand-linkedin-fill (1).svg" />
			</a>
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/ABC_6513.webp" />
			</div>
			<div className={styles.teammember6}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Akil Priyan</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Photographer</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Member</div>
				</div>
			<a href="https://www.instagram.com/aki1_pr1yan_?igsh=MW1mMWZtZWVzZXN6ag==" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton7}`}>
				<img alt="Instagram" src="/assets/icons/instagram-svgrepo-com (1).svg" />
			</a>
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/WhatsApp Image 2025-09-12 at 13.34.52_4f31c18c.jpg" />
			</div>
			<div className={styles.teammember7}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Pranav Lajeesh</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Editor</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Head of VFX</div>
				</div>
				<a href="https://www.instagram.com/_pranav.l?igsh=MTVtazV2Y2Y2eGJjOQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton8}`}>
					<img alt="Instagram" src="/assets/icons/instagram-svgrepo-com (1).svg" />
				</a>
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/IMG_255411 [1].JPG" />
			</div>
			<div className={styles.teammember8}>
				<div className={styles.paragraph2}>
					<div className={styles.ourDedicatedTeam}>Piyush Singh</div>
				</div>
				<div className={styles.container4} />
				<div className={styles.paragraph3}>
					<div className={styles.ourDedicatedTeam}>Photograher</div>
				</div>
				<div className={styles.paragraph4}>
					<div className={styles.ourDedicatedTeam}>Head of Photography</div>
				</div>
			<a href="https://www.linkedin.com/in/editwithpiyush" target="_blank" rel="noopener noreferrer" className={`${styles.instagramButton} ${styles.instagramButton9}`}>
				<img alt="LinkedIn" src="/assets/icons/brand-linkedin-fill (1).svg" />
			</a>
				<img className={styles.appContainerIcon} alt="" src="/assets/images/members/ABC_6075.webp" />
			</div>
		{/* no spacer; early triggers handle final reveal without extra height */}
		</div>
		</>
	);
};

export default TheTeamMobile;

