function doGet(e) {
  return routeRequest(e || { parameter: {} });
}

function submitAssessment(payload) {
  try {
    payload = validateSubmissionPayload(payload);
    var calculation = calculateAssessment(payload);
    return saveAssessment(payload, calculation);
  } catch (err) {
    return toUserError_(err);
  }
}

function apiGetAssessmentResult(assessmentId) {
  try {
    return getAssessmentResult(assessmentId);
  } catch (err) {
    return toUserError_(err);
  }
}

function apiInsertAssessmentToProposal(assessmentId, proposalDocUrl) {
  try {
    return insertAssessmentToProposal(assessmentId, proposalDocUrl);
  } catch (err) {
    return toUserError_(err);
  }
}
