import React from "react"
import TopNavigation from "components/navigation/TopNavigation"
import Footer from "components/Footer"
import PercentileBar from "components/viz/PercentileBar"

export default function MapPage() {

	return (
		<div className="page">
			<TopNavigation/>

			<div className="page-padding">

				<svg width="500" height={ 520 }>
					<PercentileBar
						high={ 904 }
						mid={ 847 }
						low={ 796 }
						height={ 500 }
						scale={ 1100 }
						x={ 0 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 210 }
						mid={ 202 }
						low={ 195 }
						height={ 500 }
						scale={ 1100 }
						x={ 100 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 553 }
						mid={ 321 }
						low={ 262 }
						height={ 500 }
						scale={ 1100 }
						x={ 200 }
						y={ 0 }
						width={ 50 }
					/>

					<PercentileBar
						high={ 343 }
						mid={ 119 }
						low={ 67 }
						height={ 500 }
						scale={ 1100 }
						x={ 300 }
						y={ 0 }
						width={ 50 }
					/>
				</svg>

			</div>

			<Footer/>

			<style jsx>{ `
              #map {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 100%;
              }
			` }
			</style>
		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
