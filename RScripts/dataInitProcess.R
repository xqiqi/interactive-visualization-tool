library(RJSONIO)
root <- "~/interactive-visualization-tool/"

get3dData <- function (o) {
    o <- fromJSON(o)
    path <- paste(root,o$path,sep="")
    hasHeader <- as.logical(o$hasHeader)
    dataCase <- as.numeric(o$dataCase)
    colTypes <- as.numeric(o$colTypes)

    d <- read.table(path, header=hasHeader, sep=",", col.names=c("c1", "c2", "c3"), encoding="UTF-8")

    if (dataCase == 1 && colTypes[1] == 2 && colTypes[2] == 2 && colTypes[3] == 1) {
        v1 <- as.numeric(d$c3)
        v2 <- as.numeric(d$c1)
        v3 <- as.numeric(d$c2)
        v4 <- d$c3
        v5 <- d$c1
        v6 <- d$c2
    } else if (dataCase == 1 && colTypes[1] == 2 && colTypes[2] == 1 && colTypes[3] == 2) {
        v1 <- as.numeric(d$c2)
        v2 <- as.numeric(d$c1)
        v3 <- as.numeric(d$c3)
        v4 <- d$c2
        v5 <- d$c1
        v6 <- d$c3
    } else if (dataCase == 2 && colTypes[1] == 2 && colTypes[2] == 1 && colTypes[3] == 1) {
        v1 <- as.numeric(d$c2)
        v2 <- as.numeric(d$c1)
        v3 <- as.numeric(d$c3)
        v4 <- d$c2
        v5 <- d$c1
        v6 <- d$c3
    } else if (dataCase == 2 && colTypes[1] == 1 && colTypes[2] == 1 && colTypes[3] == 2) {
        v1 <- as.numeric(d$c1)
        v2 <- as.numeric(d$c3)
        v3 <- as.numeric(d$c2)
        v4 <- d$c1
        v5 <- d$c3
        v6 <- d$c2
    } else {
        v1 <- as.numeric(d$c1)
        v2 <- as.numeric(d$c2)
        v3 <- as.numeric(d$c3)
        v4 <- d$c1
        v5 <- d$c2
        v6 <- d$c3
    }

    data <- data.frame(v1, v2, v3, v4, v5, v6)
    return(toJSON(data))
}