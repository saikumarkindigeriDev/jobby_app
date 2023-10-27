import {Component} from 'react'

import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {AiOutlineSearch} from 'react-icons/ai'
import JobCardItem from '../JobCardItem'
import Header from '../Header'

import './index.css'

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const apiJobStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const failureViewImg =
  'https://assets.ccbp.in/frontend/react-js/no-jobs-img.png'

class AllJobs extends Component {
  state = {
    profileData: {},
    jobsData: [],
    activeCheckBoxes: [],
    activeSalaryRangeId: '',
    searchInput: '',
    apiStatus: apiStatusConstants.initial,
    apiJobStatus: apiJobStatusConstants.initial,
  }

  componentDidMount() {
    this.getProfileData()
    this.getJobsData()
  }

  getProfileData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    const data = await response.json()

    console.log(data)

    if (response.ok) {
      const profileData = data.profile_details
      const updatedProfileData = {
        name: profileData.name,
        profileImageUrl: profileData.profile_image_url,
        shortBio: profileData.short_bio,
      }

      this.setState({
        profileData: updatedProfileData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  getJobsData = async () => {
    this.setState({apiJobStatus: apiJobStatusConstants.inProgress})
    const {activeCheckBoxes, searchInput, activeSalaryRangeId} = this.state

    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs?employment_type=${activeCheckBoxes}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)

    if (response.ok) {
      const jobsData = data.jobs
      const updatedJobsData = jobsData.map(eachJobData => ({
        companyLogoUrl: eachJobData.company_logo_url,
        employmentType: eachJobData.employment_type,
        jobDescription: eachJobData.job_description,
        location: eachJobData.location,
        packagePerAnnum: eachJobData.package_per_annum,
        rating: eachJobData.rating,
        title: eachJobData.title,
      }))

      this.setState({
        jobsData: updatedJobsData,
        apiJobStatus: apiJobStatusConstants.success,
      })
    } else {
      this.setState({apiJobStatus: apiStatusConstants.failure})
    }
  }

  onGetRadioOption = event => {
    this.setState({activeSalaryRangeId: event.target.id}, this.getJobsData)
  }

  onGetInputOption = e => {
    const {activeCheckBoxes} = this.state
    console.log(activeCheckBoxes)

    const inputsList = activeCheckBoxes.filter(
      eachInput => eachInput === e.target.id,
    )

    if (inputsList.length === 0) {
      this.setState(
        prevState => ({
          activeCheckBoxes: [...prevState.activeCheckBoxes, e.target.id],
        }),
        this.getJobsData,
      )
    } else {
      const filteredData = activeCheckBoxes.filter(
        eachInput => eachInput !== e.target.id,
      )
      this.setState({activeCheckBoxes: filteredData}, this.getJobsData)
    }
  }

  onChangeSearchInput = e => {
    this.setState({searchInput: e.target.value})
  }

  onSubmitSearchInput = () => {
    this.getJobsData()
  }

  onEnterSearchInput = e => {
    if (e.key === 'Enter') {
      this.getJobsData()
    }
  }

  renderProfileView = () => {
    const {profileData} = this.state
    const {name, profileImageUrl, shortBio} = profileData
    return (
      <div className="profile-container">
        <img src={profileImageUrl} className="profile-icon" alt="profile" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-description">{shortBio}</p>
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderProfileFailureView = () => (
    <div className="failure-button-container">
      <button
        type="button"
        className="failure-button"
        onClick={this.retryProfile}
      >
        Retry
      </button>
    </div>
  )

  renderProfileStatus = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProfileView()
      case apiStatusConstants.failure:
        return this.renderProfileFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  onGetCheckBoxesView = () => (
    <ul className="check-boxes-container">
      {employmentTypesList.map(eachItem => (
        <li className="li-container" key={eachItem.employmentTypeId}>
          <input
            className="input"
            id={eachItem.employmentTypeId}
            type="checkbox"
            onChange={this.onGetInputOption}
          />
          <label className="label" htmlFor={eachItem.employmentTypeId}>
            {eachItem.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onGetRadioButtonsView = () => (
    <ul className="radio-button-container">
      {salaryRangesList.map(eachItem => (
        <li className="li-container" key={eachItem.salaryRangeId}>
          <input
            type="radio"
            className="radio"
            name="option"
            id={eachItem.salaryRangeId}
            onChange={this.onGetRadioOption}
          />
          <label className="label" htmlFor={eachItem.salaryRangeId}>
            {eachItem.label}
          </label>
        </li>
      ))}
    </ul>
  )

  renderSuccessJobsView = () => {
    const {jobsData} = this.state
    const noOfJobs = jobsData.length > 0

    return noOfJobs ? (
      <>
        <ul className="ul-job-items-container">
          {jobsData.map(each => (
            <JobCardItem key={each.id} jobData={each} />
          ))}
        </ul>
      </>
    ) : (
      <div className="no-jobs-container">
        <img className="no-jobs-img" src={failureViewImg} alt="no jobs" />
        <h1>No Jobs Found</h1>
        <p>We could find any jobs. Try other filters </p>
      </div>
    )
  }

  renderJobsFailureView = () => (
    <>
      <div className="failure-img-button-container">
        <img className="failure-img" src={failureViewImg} alt="failure view" />
        <h1 className="failure-heading"> Oops! Something Went Wrong </h1>
        <p className="failure-paragraph">
          We cannot seem to find the page you are looking for
        </p>
        <div className="jobs-failure-button-container">
          <button
            className="failure-button"
            type="button"
            onClick={this.retryJobs}
          >
            Retry
          </button>
        </div>
      </div>
    </>
  )

  renderJobs = () => {
    const {apiJobStatus} = this.state

    switch (apiJobStatus) {
      case apiJobStatusConstants.success:
        return this.renderSuccessJobsView()
      case apiJobStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiJobStatus.failure:
        return this.renderJobsFailureView()
      default:
        return null
    }
  }

  render() {
    const {searchInput} = this.state

    return (
      <>
        <Header />
        <div className="all-jobs-container">
          <div className="side-bar-container">
            {this.renderProfileStatus()}
            <hr className="hr-line" />
            <h1 type="text">Type of Employment </h1>
            {this.onGetCheckBoxesView()}
            <hr className="hr-line" />
            <h1 type="text">Salary Range </h1>
            {this.onGetRadioButtonsView()}
          </div>
          <div className="jobs-container">
            <div>
              <input
                type="search"
                className="search-input"
                value={searchInput}
                placeholder="Search"
                onChange={this.onChangeSearchInput}
                onKeyDown={this.onEnterSearchInput}
              />
              <button
                type="button"
                data-testid="searchButton"
                className="search-button"
                onClick={this.onSubmitSearchInput}
              >
                <AiOutlineSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobs()}
          </div>
        </div>
      </>
    )
  }
}

export default AllJobs
