function insertAssessmentToProposal(assessmentId, proposalDocUrl) {
  var result;
  var insertId = generateInsertId_();
  var docId = '';
  try {
    assessmentId = validateAssessmentId(assessmentId);
    proposalDocUrl = validateGoogleDocUrl(proposalDocUrl, false);
    docId = extractGoogleDocId(proposalDocUrl);
    result = getAssessmentResult(assessmentId);
    var assessment = result.assessment;
    if (assessment.status !== 'SUBMITTED' && assessment.status !== 'APPROVED') {
      throw new Error('Proposal rating can only be inserted when the assessment status is SUBMITTED or APPROVED. Current status: ' + assessment.status);
    }
    if (!assessment.final_rating || assessment.final_rating === 'REVISION REQUIRED') {
      throw new Error('This assessment does not have an insertable final rating.');
    }
    var insertedText = assessment.final_rating + ' (' + Number(assessment.raw_score).toFixed(2) + '/100), Assessment Result';
    var replacement = replaceFirstRatingPlaceholder_(docId, insertedText, assessment.result_url);
    updateAssessmentProposalDoc_(assessmentId, proposalDocUrl, docId);
    logProposalInsertion({
      insert_id: insertId,
      assessment_id: assessmentId,
      proposal_doc_id: docId,
      proposal_doc_url: proposalDocUrl,
      inserted_by: getActiveUserEmail_(),
      inserted_at: nowIso_(),
      inserted_text: insertedText,
      result_url: assessment.result_url,
      insert_status: 'SUCCESS',
      error_message: ''
    });
    return { success: true, insertedText: insertedText, proposalDocUrl: proposalDocUrl, resultUrl: assessment.result_url, replacements: replacement.replacements };
  } catch (err) {
    try {
      logProposalInsertion({
        insert_id: insertId,
        assessment_id: assessmentId || '',
        proposal_doc_id: docId,
        proposal_doc_url: proposalDocUrl || '',
        inserted_by: getActiveUserEmail_(),
        inserted_at: nowIso_(),
        inserted_text: '',
        result_url: result && result.assessment ? result.assessment.result_url : '',
        insert_status: 'FAILED',
        error_message: err.message
      });
    } catch (logErr) {}
    throw err;
  }
}

function replaceFirstRatingPlaceholder_(docId, insertedText, resultUrl) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var found = body.findText(CONFIG.PLACEHOLDER);
  if (!found) {
    throw new Error('Placeholder <<rating>> was not found in the proposal document.');
  }
  var text = found.getElement().asText();
  var start = found.getStartOffset();
  var end = found.getEndOffsetInclusive();
  text.deleteText(start, end);
  text.insertText(start, insertedText);
  var linkLabel = 'Assessment Result';
  var linkStart = start + insertedText.indexOf(linkLabel);
  var linkEnd = linkStart + linkLabel.length - 1;
  text.setLinkUrl(linkStart, linkEnd, resultUrl);
  doc.saveAndClose();
  return { replacements: 1 };
}
