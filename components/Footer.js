import React from 'react'

function Footer() {
	return (
		<div>
			<div className="footer">
				<a href="http://creativecommons.org/licenses/by-sa/4.0/">
					<img src="/cc.svg" alt="CC-BY-SA" height={ 32 }/>&nbsp;&nbsp;
					All data is licensed under CC-BY-SA
				</a>
			</div>

			<style jsx>{ `
              .footer {
                margin-top: 20px;
                padding: 8px 40px 30px;
                border-top: 1px solid #dddddd;
              }
			` }
			</style>
		</div>
	)
}

export default Footer