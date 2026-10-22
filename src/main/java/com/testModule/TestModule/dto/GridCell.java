package com.testModule.TestModule.dto;

import java.util.List;

public class GridCell {
    private String cellId;
    private Long termId;
    private String cellType;  // "TERM" or "DEFINITION"
    private String displayText;

    public GridCell() {
    }

    public GridCell(String cellId, Long termId, String cellType, String displayText) {
        this.cellId = cellId;
        this.termId = termId;
        this.cellType = cellType;
        this.displayText = displayText;
    }

    public String getCellId() {
        return cellId;
    }

    public void setCellId(String cellId) {
        this.cellId = cellId;
    }

    public Long getTermId() {
        return termId;
    }

    public void setTermId(Long termId) {
        this.termId = termId;
    }

    public String getCellType() {
        return cellType;
    }

    public void setCellType(String cellType) {
        this.cellType = cellType;
    }

    public String getDisplayText() {
        return displayText;
    }

    public void setDisplayText(String displayText) {
        this.displayText = displayText;
    }
}
