"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Review = {
	displayName: string;
	comment?: string;
	starRating?: number;
};

const AboutSection = () => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

        const hasFetchedRef = useRef(false);

        useEffect(() => {
                if (hasFetchedRef.current) {
                        return;
                }

                hasFetchedRef.current = true;

                let isMounted = true;

		const fetchReviews = async () => {
			try {
				const response = await fetch("/reviews.json");
				if (!response.ok) {
					throw new Error("No fue posible obtener las reseñas");
				}
				const data = await response.json();
				const rawReviews = Array.isArray(data?.reviews)
					? data.reviews
					: data?.reviews ?? [];

				const ratingMap: Record<string, number> = {
					ONE: 1,
					TWO: 2,
					THREE: 3,
					FOUR: 4,
					FIVE: 5,
				};

				const mappedReviews: Review[] = Array.isArray(rawReviews)
					? rawReviews
							.map((item: any) => {
								const displayName = item?.reviewer?.displayName;
								const comment = item?.comment;
								const starRatingValue = item?.starRating;

								let starRating: number | undefined;
								if (typeof starRatingValue === "string") {
									starRating =
										ratingMap[
											starRatingValue.toUpperCase()
										];
								} else if (
									typeof starRatingValue === "number"
								) {
									starRating = Math.max(
										1,
										Math.min(5, starRatingValue)
									);
								}

								return {
									displayName,
									comment,
									starRating,
								};
							})
							.filter((item) => item.displayName)
					: [];

				const shuffledReviews = mappedReviews
					.map((item) => ({ item, sortKey: Math.random() }))
					.sort((a, b) => a.sortKey - b.sortKey)
					.map(({ item }) => item);

				if (isMounted) {
					setReviews(shuffledReviews);
					setActiveIndex(0);
				}
			} catch (error) {
				console.error(error);
				if (isMounted) {
					setReviews([]);
				}
			}
		};

		fetchReviews();

                return () => {
                        isMounted = false;
                };
        }, []);

	useEffect(() => {
		if (!reviews.length) {
			return;
		}

		const intervalDuration = Math.floor(6000 + Math.random() * 2000);
		const interval = setInterval(() => {
			setActiveIndex((prevIndex) => (prevIndex + 1) % reviews.length);
		}, intervalDuration);

		return () => clearInterval(interval);
	}, [reviews]);

	const activeReview = reviews[activeIndex];

	return (
		<section
			id="nosotros"
			aria-labelledby="nosotros-title"
			className="mx-auto relative grid max-w-7xl items-center gap-8 px-4 py-16 md:gap-12 md:px-6 md:py-20 bg-gradient-to-br from-white to-gray-50/50"
		>
			{/* Divisor decorativo opcional */}
			<div className="absolute inset-0 -z-10 rounded-3xl bg-[var(--lime)]/5" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				className="order-2 md:order-1"
			>
				<h2
					id="nosotros-title"
					className="mb-6 text-2xl font-bold text-[var(--text-dark)] md:text-3xl"
				>
					Quiénes Somos
				</h2>
				<p className="mb-8 text-base leading-relaxed text-gray-600 md:text-lg">
					Inmobiliaria Villanueva García es sinónimo de excelencia y
					confianza. Nuestra misión es brindarte una experiencia única
					al encontrar tu próximo hogar o inversión. Fusionamos
					elegancia, modernidad y total transparencia en cada paso del
					proceso, para que te sientas acompañado desde el primer
					vistazo hasta la firma final.
				</p>
				<motion.a
					href="#contacto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="inline-block rounded-full bg-[var(--lime)] px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-lime-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/50 md:text-base"
				>
					Contáctanos Hoy
				</motion.a>

				<div className="mt-10 rounded-3xl bg-gradient-to-br from-lime-500/10 via-white/30 to-lime-500/10 p-[1px] backdrop-blur">
					<div className="rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-lime-200/60 dark:bg-white/90">
						<h3 className="text-sm font-semibold uppercase tracking-wide text-lime-600">
							Reseñas de Nuestros Clientes
						</h3>
						<div className="mt-4 min-h-[150px]">
							<AnimatePresence mode="wait">
								{activeReview ? (
									<motion.div
										key={`${activeReview.displayName}-${activeIndex}`}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.4 }}
										className="space-y-3 text-gray-700"
									>
										<div className="flex flex-wrap items-center gap-2 text-base font-semibold text-[var(--text-dark)]">
											<Star className="h-5 w-5 text-lime-500" />
											<span>
												{activeReview.displayName}
											</span>
											{typeof activeReview.starRating ===
												"number" && (
												<span className="text-sm font-medium text-gray-500">
													{(() => {
														const normalized =
															Math.round(
																activeReview.starRating
															);
														const starCount =
															Math.max(
																0,
																Math.min(
																	5,
																	normalized
																)
															);
														return starCount > 0
															? "★".repeat(
																	starCount
															  )
															: null;
													})()}
												</span>
											)}
										</div>
										{activeReview.comment ? (
											<p className="text-sm leading-relaxed text-gray-600 md:text-base">
												“{activeReview.comment}”
											</p>
										) : null}
									</motion.div>
								) : (
									<motion.p
										key="fallback"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.4 }}
										className="text-sm font-medium text-gray-600 md:text-base"
									>
										Aún no tenemos reseñas disponibles,
										¡pero pronto compartiremos las
										experiencias de nuestros clientes!
									</motion.p>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
};

export default AboutSection;
