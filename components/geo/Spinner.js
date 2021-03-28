import { Spin } from "antd"

export default function Spinner( props ) {
	return (
		<div className="spinner">
			<div className="wrap">
				<Spin size="large"/>
			</div>

			<style jsx>{`
              .spinner {
                position: fixed;
                width: 100vw;
                height: 90vh;
                top: 0;
              }

              .wrap {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
			`}</style>
		</div>
	)
}
